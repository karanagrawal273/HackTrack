import axios from 'axios';
import Contest from '../models/contest.model';
import Notification from '../models/notification.model';
import CalendarEvent from '../models/calendarEvent.model';
import * as dotenv from 'dotenv';
import { scheduleNotificationsForContest } from './notification.service';

dotenv.config();

const CLIST_API_URL = process.env.CLIST_API_URL || "https://clist.by/api/v4/contest/";
const CLIST_USERNAME = process.env.CLIST_USERNAME;
const CLIST_API_KEY = process.env.CLIST_API_KEY;

const PLATFORMS = "codeforces.com,leetcode.com,codechef.com,atcoder.jp,hackerrank.com,devpost.com";

export const fetchAndSaveContests = async () => {
  if (!CLIST_USERNAME || !CLIST_API_KEY) {
    console.error("CList API credentials are not defined in .env file.");
    return;
  }

  try {
    // console.log("Cleaning up old contests and sync records from the database...");

    const now = new Date();
    // Find old contests
    const oldContests = await Contest.find({ endTime: { $lt: now } }).select('_id');
    const oldContestIds = oldContests.map(c => c._id);

    if (oldContestIds.length > 0) {
      // console.log(`Found ${oldContestIds.length} expired contests. Deleting associated data...`);
      const deletedNotifs = await Notification.deleteMany({contest: { $in: oldContestIds}});
      const deletedCalendarEvents = await CalendarEvent.deleteMany({contest: { $in: oldContestIds}});
      const deleteContestResult = await Contest.deleteMany({ _id: { $in: oldContestIds } });
      // console.log(`Cleanup Complete: Deleted ${deleteContestResult.deletedCount} contests, ${deletedNotifs.deletedCount} notifications, and ${deletedCalendarEvents.deletedCount} sync records.`);
    } else {
      // console.log("No old contests found to delete.");
    }
    
    // console.log("Fetching upcoming contests from CList.by API...");

    const response = await axios.get(CLIST_API_URL, {
      headers: {
        'Authorization': `ApiKey ${CLIST_USERNAME}:${CLIST_API_KEY}`
      },
      params: {
        upcoming: true,
        start__gte: new Date().toISOString(),
        resource__in: PLATFORMS,
        order_by: 'start',
        limit: 100
      }
    });

    const contests = response.data.objects;
    // console.log(`Found ${contests.length} upcoming contests.`);

    for (const contestData of contests) {
      const contestToSave = {
        clist_id: contestData.id,
        name: contestData.event,
        platform: contestData.host,
        url: contestData.href,
        startTime: new Date(contestData.start+'Z'),
        endTime: new Date(contestData.end+'Z'),
        durationSeconds: contestData.duration,
      };

      // Use findOneAndUpdate with upsert to avoid duplicates
      const savedContest = await Contest.findOneAndUpdate(
        { clist_id: contestToSave.clist_id }, // Query: find by unique clist_id
        contestToSave, // Data to insert or update with
        { upsert: true, new: true, setDefaultsOnInsert: true } // Options
      );

      if (savedContest) {
        await scheduleNotificationsForContest(savedContest);
      }
    }    
    // console.log("Successfully fetched, saved, and scheduled notifications for contests.");

  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error("Error fetching contests from CList API:", error.response?.data);
    } else {
        console.error("An unexpected error occurred:", error);
    }
  }
};
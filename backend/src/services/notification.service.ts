import User,{IUser} from '../models/user.model';
import Contest, {IContest} from '../models/contest.model';
import Notification from '../models/notification.model';
import { addContestToGoogleCalendar } from './calendar.service';

const REMINDER_TIMES_MINUTES = [60, 1440];

export const scheduleNotificationsForContest = async (contest: IContest) => {
  try {
    // console.log("Scheduling notification for the contest");
    const users = await User.find({ 
      isVerified: true,
      trackedPlatforms: contest.platform 
    }).select('email name isGoogleCalendarConnected googleRefreshToken _id');

    for (const user of users) {
      await addContestToGoogleCalendar(user, contest);

      for (const minutesBefore of REMINDER_TIMES_MINUTES) {
        const sendTime = new Date(contest.startTime.getTime() - minutesBefore * 60000);
        const now = new Date();

        if (sendTime > now) {
           await Notification.findOneAndUpdate(
            { user: user._id, contest: contest._id, minutesBefore: minutesBefore },
            { 
              user: user._id, 
              contest: contest._id, 
              minutesBefore: minutesBefore, 
              sendTime: sendTime, 
              status: 'pending' 
            },
            { upsert: true }
          );
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// This schedules all reminders for a single, new user
export const syncNotificationsForUser = async (user: IUser) => {
  // console.log(`Syncing all notifications for new user: ${user.email}`);
  try {
    // 1. Find all upcoming contests this user tracks
    const contests = await Contest.find({
      platform: { $in: user.trackedPlatforms },
      startTime: { $gte: new Date() }
    });

    for (const contest of contests) {
      // 2. Add to their Google Calendar
      await addContestToGoogleCalendar(user, contest);

      // 3. Schedule email reminders
      for (const minutesBefore of REMINDER_TIMES_MINUTES) {
        const sendTime = new Date(contest.startTime.getTime() - minutesBefore * 60000);
        const now = new Date();

        if (sendTime > now) {
           await Notification.findOneAndUpdate(
            { user: user._id, contest: contest._id, minutesBefore: minutesBefore },
            { 
              user: user._id, 
              contest: contest._id, 
              minutesBefore: minutesBefore, 
              sendTime: sendTime, 
              status: 'pending' 
            },
            { upsert: true }
          );
        }
      }
    }
    // console.log(`Finished syncing notifications for ${user.email}`);
  } catch (error) {
    console.error(error);
  }
};
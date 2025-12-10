// src/services/calendar.service.ts (New File for core sync logic)

import UserModel, { IUser } from '../models/User';
import ContestModel, { IContest } from '../models/Contest';
import CalendarEvent from '../models/CalendarEvent';
import { Types } from 'mongoose'; 
// NOTE: We assume you rename your raw utility file to calendarUtils.ts
import { insertOrUpdateGoogleEvent, CalendarEventData, UserAuthData } from '../utils/calendarUtils'; 

// Assert Types (The final fix for your TS errors is ensuring the interfaces are used here)
type ContestWithId = IContest & { _id: Types.ObjectId, platform: string };
type UserWithSyncFields = IUser & { 
    _id: Types.ObjectId, 
    googleRefreshToken: string, 
    calendarSync: Boolean 
};

/**
 * Adds or updates a contest event on Google Calendar, using CalendarEvent model for deduplication.
 */
export const addContestToGoogleCalendar = async (user: UserWithSyncFields, contest: ContestWithId) => {
    
    if (!user.calendarSync || !user.googleRefreshToken) {
        return false;
    }

    const existingRecord = await CalendarEvent.findOne({
        user: user._id,
        contest: contest._id,
    });

    const eventData: CalendarEventData = {
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime,
        url: contest.url,
    };
    const authData: UserAuthData = { googleRefreshToken: user.googleRefreshToken };
    
    // Call the Google API utility
    const googleEventId = await insertOrUpdateGoogleEvent(
        authData,
        eventData,
        existingRecord?.googleEventId
    );
    
    if (googleEventId) {
        if (!existingRecord) {
            await CalendarEvent.create({
                user: user._id,
                contest: contest._id,
                googleEventId: googleEventId,
            });
        }
        return true;
    }
    
    return false;
};
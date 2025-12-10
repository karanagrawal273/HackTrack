// src/utils/calendarService.ts

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Define the scope needed to create calendar events
const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar']; // Added broader scope for safety

// IMPORTANT: Replace with your actual Client ID and Secret (from Google Cloud Console)
const CLIENT_ID = process.env.GOOGLE_MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_MAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; 

// Initialize the OAuth2 Client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

/** Defines the minimum data needed for calendar event operations. */
export type CalendarEventData = { 
    name: string; 
    startTime: Date; 
    endTime: Date; 
    url: string; 
};

/** Defines the required auth data for the user. */
export type UserAuthData = { 
    googleRefreshToken: string; 
};

/**
 * Creates a Google Calendar API client using the user's stored refresh token.
 * @param refreshToken - The user's Google Calendar Refresh Token.
 * @returns A Google Calendar client object.
 */
const getCalendarClient = (refreshToken: string): calendar_v3.Calendar => {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.calendar({ version: 'v3', auth: oauth2Client as OAuth2Client });
};

export const insertOrUpdateGoogleEvent = async (
    authData: UserAuthData, 
    eventData: CalendarEventData, 
    googleEventId?: string | null
): Promise<string | null> => {

    if (!authData.googleRefreshToken) return null;

    try {
        const calendar = getCalendarClient(authData.googleRefreshToken);
        
        const event: calendar_v3.Schema$Event = {
            summary: `HackTrack: ${eventData.name}`,
            description: `Contest Platform Link: ${eventData.url}`,
            start: { dateTime: eventData.startTime.toISOString(), timeZone: 'UTC' },
            end: { dateTime: eventData.endTime.toISOString(), timeZone: 'UTC' },
            reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 30 }, { method: 'popup', minutes: 10 }] },
        };

        let result;
        if (googleEventId) {
            result = await calendar.events.update({
                calendarId: 'primary',
                eventId: googleEventId,
                requestBody: event,
            });
            console.log(`Calendar event updated (${googleEventId}).`);
        } else {
            result = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });
            console.log(`Calendar event created: ${result.data.htmlLink}`);
        }

        return result.data.id || null;

    } catch (error) {
        console.error(`Error in Google API call (${googleEventId ? 'UPDATE' : 'INSERT'}):`, error);
        return null;
    }
};

/**
 * Utility to generate the initial consent URL for the frontend.
 */
export const getConsentUrl = () => {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
         console.error("Missing Google OAuth credentials for consent URL.");
         return null;
    }
    return oauth2Client.generateAuthUrl({
         access_type: 'offline', // crucial to get a refresh token
         scope: CALENDAR_SCOPES,
         prompt: 'consent',
    });
};
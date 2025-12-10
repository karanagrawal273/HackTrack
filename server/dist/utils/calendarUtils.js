"use strict";
// src/utils/calendarService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConsentUrl = exports.insertOrUpdateGoogleEvent = void 0;
const googleapis_1 = require("googleapis");
// Define the scope needed to create calendar events
const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar']; // Added broader scope for safety
// IMPORTANT: Replace with your actual Client ID and Secret (from Google Cloud Console)
const CLIENT_ID = process.env.GOOGLE_MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_MAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
// Initialize the OAuth2 Client
const oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
/**
 * Creates a Google Calendar API client using the user's stored refresh token.
 * @param refreshToken - The user's Google Calendar Refresh Token.
 * @returns A Google Calendar client object.
 */
const getCalendarClient = (refreshToken) => {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
};
const insertOrUpdateGoogleEvent = async (authData, eventData, googleEventId) => {
    if (!authData.googleRefreshToken)
        return null;
    try {
        const calendar = getCalendarClient(authData.googleRefreshToken);
        const event = {
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
        }
        else {
            result = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });
            console.log(`Calendar event created: ${result.data.htmlLink}`);
        }
        return result.data.id || null;
    }
    catch (error) {
        console.error(`Error in Google API call (${googleEventId ? 'UPDATE' : 'INSERT'}):`, error);
        return null;
    }
};
exports.insertOrUpdateGoogleEvent = insertOrUpdateGoogleEvent;
/**
 * Utility to generate the initial consent URL for the frontend.
 */
const getConsentUrl = () => {
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
exports.getConsentUrl = getConsentUrl;

// src/utils/calendar.ts

import { IContest } from '@/types/index'; // Adjust path if necessary

/**
 * Converts ISO 8601 string to basic Google Calendar format (YYYYMMDDTHHMMSSZ).
 * Example: 2025-12-08T05:30:00.000Z -> 20251208T053000Z
 */
const toGoogleCalendarFormat = (isoString: string): string => {
    // Removes hyphens, colons, milliseconds, and ensures it ends with Z
    return isoString.replace(/[-:]|\.\d{3}/g, '').replace('Z', '') + 'Z';
};

/**
 * Generates a public URL for adding a contest event to Google Calendar.
 */
export const generateGoogleCalendarLink = (contest: IContest): string => {
    const start = toGoogleCalendarFormat(contest.startTime);
    const end = toGoogleCalendarFormat(contest.endTime);
    
    const calendarUrl = new URL('https://calendar.google.com/calendar/render');
    
    calendarUrl.searchParams.set('action', 'TEMPLATE');
    calendarUrl.searchParams.set('text', `[${contest.platform}] ${contest.name}`);
    calendarUrl.searchParams.set('dates', `${start}/${end}`);
    calendarUrl.searchParams.set('details', `Contest details: ${contest.url}`);
    calendarUrl.searchParams.set('sf', 'true'); // Required by Google for rendering
    
    return calendarUrl.toString();
};
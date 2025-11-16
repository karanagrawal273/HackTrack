import { google } from 'googleapis';
import { IUser } from '../models/user.model';
import { IContest } from '../models/contest.model';
import CalendarEvent from '../models/calendarEvent.model';
import User from '../models/user.model';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const addContestToGoogleCalendar = async (user: IUser, contest: IContest) => {
  if (!user.isGoogleCalendarConnected || !user.googleRefreshToken) {
    return;
  }
  const startDate = new Date(contest.startTime);
  let endDate = new Date(contest.endTime);

  // Safety Check: If endDate is invalid, calculate it using duration
  if (isNaN(endDate.getTime())) {
    // console.warn(`Invalid End Time for ${contest.name}. Calculating from duration.`);
    const durationMs = (contest.durationSeconds || 7200) * 1000; // Default to 2 hours if missing
    endDate = new Date(startDate.getTime() + durationMs);
  }

  // Double check validity
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    // console.error(`Skipping calendar event for ${contest.name}: Invalid Date format.`);
    return;
  }
  let syncRecordCreated = false;
  try {
    // --- STEP 1: Attempt to create the sync record FIRST ---
    await CalendarEvent.create({
      user: user._id,
      contest: contest._id,
      googleEventId: 'placeholder', // Temporarily use a placeholder
    });
    syncRecordCreated = true; // If this line is reached, the record is new
    // console.log(`Created placeholder sync record for ${user.email}, contest ${contest.name}`);

  } catch (error: any) {
    // --- STEP 2: Check if it failed because it already exists ---
    if (error.code === 11000) { // E11000 is the duplicate key error code
      // console.log(`Sync record already exists for ${user.email}, contest ${contest.name}. Skipping.`);
      return; // Already synced or being synced, do nothing further.
    } else {
      // Different error occurred during sync record creation
      // console.error(`Error creating sync record for ${user.email}, contest ${contest.name}:`, error);
      return; // Don't proceed if we couldn't create the sync record
    }
  }

  // --- STEP 3: If sync record was successfully created, THEN add to Google Calendar ---
  if (syncRecordCreated) {
    try {
      oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = { summary: contest.name,
        location: contest.platform,
        description: `Platform: ${contest.platform}\nLink: ${contest.url}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC',
        },
        };

      const createdEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      // --- STEP 4: Update the sync record with the real Google Event ID ---
      if (createdEvent.data.id) {
        await CalendarEvent.updateOne(
          { user: user._id, contest: contest._id },
          { googleEventId: createdEvent.data.id } // Update placeholder with real ID
        );
        // console.log(`Event created on Google Calendar and sync record updated for ${user.email}: ${contest.name}`);
      } else {
        // console.error(`Event created for ${contest.name} but received no Google Event ID. Removing placeholder sync record.`);
        // Clean up placeholder if Google failed strangely
        await CalendarEvent.deleteOne({ user: user._id, contest: contest._id, googleEventId: 'placeholder' });
      }

    } catch (googleError: any) {
      // console.error(`Failed to create Google Calendar event for ${user.email}, contest ${contest.name}:`, googleError);
      // Clean up the placeholder sync record if the Google API call failed
      await CalendarEvent.deleteOne({ user: user._id, contest: contest._id, googleEventId: 'placeholder' });

      // Handle invalid grant specifically
      if (googleError?.response?.data?.error === 'invalid_grant') {
          console.warn(`Invalid grant for user ${user.email}. Disconnecting their calendar.`);
          await User.findByIdAndUpdate(user._id, {
            isGoogleCalendarConnected: false, 
            googleAccessToken: undefined, 
            googleRefreshToken: undefined
          });
      }else {
          // Log the specific error from Google
          console.error(`Failed to create Google Calendar event for ${user.email}, contest ${contest.name}:`, googleError.message);
      }
    }
  }
};
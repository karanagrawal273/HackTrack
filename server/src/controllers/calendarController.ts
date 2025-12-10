// src/controllers/calendarController.ts

import { Request, Response } from 'express';
import { google } from 'googleapis';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
// FIX: Import the necessary utility functions from the new service file
import { getConsentUrl } from '../utils/calendarUtils'; 
import { syncNotificationsForUser } from '../services/notificationService';

// IMPORTANT: We still need the OAuth2 client setup here to handle the CALLBACK
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_MAIL_CLIENT_ID,
  process.env.GOOGLE_MAIL_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * @desc Step 1: Initiates Google OAuth flow, sending the client to Google's consent screen.
 * @route GET /api/v1/calendar/auth
 * @access Private
 */

export const disconnectGoogleCalendar = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                // CRITICAL: Clear the security-sensitive token and reset flags
                googleRefreshToken: undefined, 
                calendarSync: false,
                googleCalendarId: undefined, // Clear calendar ID if you were using it
            },
            {
                new: true, // Return the updated document
            }
        ).select('-password'); // Do not send the password hash

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Return the updated user object so the client's AuthContext can refresh
        res.status(200).json({ success: true, data: user });

    } catch (error) {
        console.error('Error disconnecting Google Calendar:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

export const googleAuth = (req: AuthenticatedRequest, res: Response) => {
  // FIX: Use the utility function to generate the consent URL
  const authUrl = getConsentUrl(); 

  if (!authUrl) {
    return res.status(500).json({ success: false, error: 'Server configuration error for Google OAuth.' });
  }

  // Pass the user ID as state to identify the user after the redirect
  const consentUrl = authUrl + `&state=${req.user?.id.toString()}`;

  res.status(200).json({ success: true, authUrl: consentUrl });
};

/**
 * @desc Step 2: Handles the callback from Google, exchanges code for tokens, and saves token.
 * @route GET /api/v1/calendar/oauth-callback
 * @access Public
 */
export const oauthCallback = async (req: Request, res: Response) => {

  // console.log("OAuth Callback Hit. Query:", req.query);
  const { code, state, error } = req.query; // Ensure 'error' is destructured

    if (error === 'access_denied') { // Check for explicit denial
        console.error("User denied access during Google consent.");
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendarError=AccessDenied`); 
    }

    if (!code || !state) {
        // If 'code' is missing but 'error' is not 'access_denied', something else failed.
        console.error("FAILURE: Missing 'code' or 'state' in Google response (Unknown failure).");
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendarError=AuthFailed`);
    }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
        throw new Error("Failed to obtain Refresh Token (Consent needed).");
    }
    
    // FIX: Update User Model fields to match the implementation plan
    // Save the permanent Refresh Token and enable sync
    await User.findByIdAndUpdate(state as string, {
      googleRefreshToken: refreshToken,
      calendarSync: true, // Enable sync automatically upon successful token acquisition
    });

    const user = await User.findById(state as string);
    if (user) {
        await syncNotificationsForUser(user);
    }

    // Successfully linked! Redirect to the dashboard.
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendarSuccess=true`);

  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    // Redirect to client with an error
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendarError=TokenExchangeFailed`);
  }
};
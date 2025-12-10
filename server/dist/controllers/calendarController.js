"use strict";
// src/controllers/calendarController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthCallback = exports.googleAuth = exports.disconnectGoogleCalendar = void 0;
const googleapis_1 = require("googleapis");
const User_1 = __importDefault(require("../models/User"));
// FIX: Import the necessary utility functions from the new service file
const calendarUtils_1 = require("../utils/calendarUtils");
const notificationService_1 = require("../services/notificationService");
// IMPORTANT: We still need the OAuth2 client setup here to handle the CALLBACK
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_MAIL_CLIENT_ID, process.env.GOOGLE_MAIL_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
/**
 * @desc Step 1: Initiates Google OAuth flow, sending the client to Google's consent screen.
 * @route GET /api/v1/calendar/auth
 * @access Private
 */
const disconnectGoogleCalendar = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User_1.default.findByIdAndUpdate(userId, {
            // CRITICAL: Clear the security-sensitive token and reset flags
            googleRefreshToken: undefined,
            calendarSync: false,
            googleCalendarId: undefined, // Clear calendar ID if you were using it
        }, {
            new: true, // Return the updated document
        }).select('-password'); // Do not send the password hash
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        // Return the updated user object so the client's AuthContext can refresh
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error('Error disconnecting Google Calendar:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.disconnectGoogleCalendar = disconnectGoogleCalendar;
const googleAuth = (req, res) => {
    // FIX: Use the utility function to generate the consent URL
    const authUrl = (0, calendarUtils_1.getConsentUrl)();
    if (!authUrl) {
        return res.status(500).json({ success: false, error: 'Server configuration error for Google OAuth.' });
    }
    // Pass the user ID as state to identify the user after the redirect
    const consentUrl = authUrl + `&state=${req.user?.id.toString()}`;
    res.status(200).json({ success: true, authUrl: consentUrl });
};
exports.googleAuth = googleAuth;
/**
 * @desc Step 2: Handles the callback from Google, exchanges code for tokens, and saves token.
 * @route GET /api/v1/calendar/oauth-callback
 * @access Public
 */
const oauthCallback = async (req, res) => {
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
        const { tokens } = await oauth2Client.getToken(code);
        const refreshToken = tokens.refresh_token;
        if (!refreshToken) {
            throw new Error("Failed to obtain Refresh Token (Consent needed).");
        }
        // FIX: Update User Model fields to match the implementation plan
        // Save the permanent Refresh Token and enable sync
        await User_1.default.findByIdAndUpdate(state, {
            googleRefreshToken: refreshToken,
            calendarSync: true, // Enable sync automatically upon successful token acquisition
        });
        const user = await User_1.default.findById(state);
        if (user) {
            await (0, notificationService_1.syncNotificationsForUser)(user);
        }
        // Successfully linked! Redirect to the dashboard.
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendarSuccess=true`);
    }
    catch (error) {
        console.error('Error during Google OAuth callback:', error);
        // Redirect to client with an error
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendarError=TokenExchangeFailed`);
    }
};
exports.oauthCallback = oauthCallback;

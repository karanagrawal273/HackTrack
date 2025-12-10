// src/routes/calendar.ts

import express from 'express';
import { protect } from '../middleware/auth';
import { googleAuth, oauthCallback, disconnectGoogleCalendar } from '../controllers/calendarController';

const router = express.Router();

// Route to initiate the OAuth flow (Must be protected to get req.user.id)
router.get('/auth', protect, googleAuth);

// Route for Google to call back (MUST match GOOGLE_REDIRECT_URI exactly)
router.get('/oauth-callback', oauthCallback); 
router.post('/disconnect', protect, disconnectGoogleCalendar);

export default router;
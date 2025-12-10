"use strict";
// src/routes/calendar.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const calendarController_1 = require("../controllers/calendarController");
const router = express_1.default.Router();
// Route to initiate the OAuth flow (Must be protected to get req.user.id)
router.get('/auth', auth_1.protect, calendarController_1.googleAuth);
// Route for Google to call back (MUST match GOOGLE_REDIRECT_URI exactly)
router.get('/oauth-callback', calendarController_1.oauthCallback);
router.post('/disconnect', auth_1.protect, calendarController_1.disconnectGoogleCalendar);
exports.default = router;

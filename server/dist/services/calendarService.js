"use strict";
// src/services/calendar.service.ts (New File for core sync logic)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addContestToGoogleCalendar = void 0;
const CalendarEvent_1 = __importDefault(require("../models/CalendarEvent"));
// NOTE: We assume you rename your raw utility file to calendarUtils.ts
const calendarUtils_1 = require("../utils/calendarUtils");
/**
 * Adds or updates a contest event on Google Calendar, using CalendarEvent model for deduplication.
 */
const addContestToGoogleCalendar = async (user, contest) => {
    if (!user.calendarSync || !user.googleRefreshToken) {
        return false;
    }
    const existingRecord = await CalendarEvent_1.default.findOne({
        user: user._id,
        contest: contest._id,
    });
    const eventData = {
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime,
        url: contest.url,
    };
    const authData = { googleRefreshToken: user.googleRefreshToken };
    // Call the Google API utility
    const googleEventId = await (0, calendarUtils_1.insertOrUpdateGoogleEvent)(authData, eventData, existingRecord?.googleEventId);
    if (googleEventId) {
        if (!existingRecord) {
            await CalendarEvent_1.default.create({
                user: user._id,
                contest: contest._id,
                googleEventId: googleEventId,
            });
        }
        return true;
    }
    return false;
};
exports.addContestToGoogleCalendar = addContestToGoogleCalendar;

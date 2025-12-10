"use strict";
// src/services/notificationService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPendingNotifications = exports.checkAndScheduleAllNotifications = exports.syncNotificationsForUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Contest_1 = __importDefault(require("../models/Contest"));
const Notification_1 = __importDefault(require("../models/Notification")); // Use the new model
const calendarService_1 = require("./calendarService"); // New Service Layer
const emailService_1 = require("../utils/emailService");
const REMINDER_TIMES_MINUTES = [60, 1440];
const syncNotificationsForUser = async (user) => {
    try {
        const userWithSyncFields = user; // Assert the required fields for services
        // 1. Find all upcoming contests this user tracks (far into the future)
        const contests = await Contest_1.default.find({
            platform: { $in: user.preferredPlatforms }, // Use user's preferences
            startTime: { $gte: new Date() } // Only future contests
        }).exec();
        console.log(`[Historical Sync] User ${user.email} found ${contests.length} contests to schedule.`);
        for (const contest of contests) {
            // 2. Add/Update Contest in Google Calendar (Deduplication handled inside calendar.service)
            // This syncs the *entire history* of relevant contests to their calendar.
            if (userWithSyncFields.calendarSync) {
                await (0, calendarService_1.addContestToGoogleCalendar)(userWithSyncFields, contest);
            }
            // 3. Schedule email reminders (24hr and 1hr)
            for (const minutesBefore of REMINDER_TIMES_MINUTES) {
                const sendTime = new Date(contest.startTime.getTime() - minutesBefore * 60000);
                // Only schedule if the reminder time hasn't passed yet
                if (sendTime > new Date()) {
                    await Notification_1.default.findOneAndUpdate({ user: user._id, contest: contest._id, minutesBefore: minutesBefore }, {
                        user: user._id,
                        contest: contest._id,
                        minutesBefore: minutesBefore,
                        sendTime: sendTime,
                        status: 'pending'
                    }, { upsert: true } // Ensures the record is only created once
                    );
                }
            }
        }
    }
    catch (error) {
        console.error(`Error in syncNotificationsForUser for ${user.email}:`, error);
    }
};
exports.syncNotificationsForUser = syncNotificationsForUser;
const checkAndScheduleAllNotifications = async () => {
    try {
        const now = Date.now();
        const maxTimeMs = 30 * 24 * 60 * 60 * 1000;
        // Fetch users who have selected platforms and need checking
        // NOTE: We MUST select all required fields explicitly for the casting to work.
        const users = await User_1.default.find({ isVerified: true, preferredPlatforms: { $exists: true, $ne: [] } })
            .select('+googleRefreshToken')
            .exec();
        // Fetch all relevant contests in the next 30 days
        const contests = await Contest_1.default.find({
            endTime: { $gt: new Date() },
            startTime: { $lte: new Date(now + maxTimeMs) }
        }).lean();
        console.log(`[Scheduler Check] Found ${contests.length} contests for ${users.length} eligible users.`);
        for (const user of users) {
            // Optimization: Filter contests by user preference
            const relevantContests = contests.filter(contest => user.preferredPlatforms?.includes(contest.platform));
            for (const contest of relevantContests) {
                // 1. Calendar Sync (Immediate and Deduplicated)
                if (user.calendarSync) {
                    await (0, calendarService_1.addContestToGoogleCalendar)(user, contest);
                }
                // 2. Email Notification Scheduling (Time-Constrained)
                for (const minutesBefore of REMINDER_TIMES_MINUTES) {
                    const sendTime = new Date(contest.startTime.getTime() - minutesBefore * 60000);
                    if (sendTime > new Date()) {
                        // Upsert the notification record to ensure it's only created once
                        await Notification_1.default.findOneAndUpdate({ user: user._id, contest: contest._id, minutesBefore: minutesBefore }, {
                            user: user._id,
                            contest: contest._id,
                            minutesBefore: minutesBefore,
                            sendTime: sendTime,
                            status: 'pending'
                        }, { upsert: true });
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('Error in main notification scheduler:', error);
    }
};
exports.checkAndScheduleAllNotifications = checkAndScheduleAllNotifications;
const processPendingNotifications = async () => {
    try {
        const now = new Date();
        // 1. Find all notifications whose sendTime is NOW or in the past, and status is 'pending'
        const notificationsToSend = await Notification_1.default.find({
            sendTime: { $lte: now },
            status: 'pending',
        })
            // 2. Populate the related User and Contest data needed for the email
            .populate([
            { path: 'user', select: 'email name' },
            { path: 'contest', select: 'name platform url startTime' }
        ]);
        console.log(`[Email Execution] Found ${notificationsToSend.length} pending emails to send.`);
        for (const notif of notificationsToSend) {
            const user = notif.user;
            const contest = notif.contest;
            if (!user?.email)
                continue;
            try {
                const minutes = notif.minutesBefore;
                const timeString = minutes === 1440 ? '24 hours' : '1 hour';
                const notificationType = minutes === 1440 ? '24-Hour Reminder' : '1-Hour Reminder';
                // Construct and send the email
                const emailBody = `
                    <h1>HackTrack ${notificationType}</h1>
                    <p>The **${contest.name}** contest on ${contest.platform} is starting soon!</p>
                    <p>Time Remaining: Approximately ${timeString}.</p>
                    <p>Link: <a href="${contest.url}">Go to Contest</a></p>
                `;
                await (0, emailService_1.sendEmail)(user.email, `HackTrack Reminder: ${contest.name}`, emailBody);
                // 3. Delete the sent notification
                await Notification_1.default.deleteOne({ _id: notif._id });
                console.log(`Email sent successfully for user ${user.email} (${timeString}).`);
            }
            catch (error) {
                console.error(`Failed to send email for Notification ID ${notif._id}:`, error);
                // Mark as failed to avoid retrying indefinitely if a non-recoverable error occurs
                await Notification_1.default.updateOne({ _id: notif._id }, { status: 'failed' });
            }
        }
    }
    catch (error) {
        console.error('Error processing pending notifications:', error);
    }
};
exports.processPendingNotifications = processPendingNotifications;

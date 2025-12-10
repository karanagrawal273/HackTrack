"use strict";
// scheduler.ts (Original, Correct Structure)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHackTrackScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const contestService_1 = require("../services/contestService");
const notificationService_1 = require("../services/notificationService");
const notificationService_2 = require("../services/notificationService");
const startHackTrackScheduler = () => {
    // 1. Contest Data Fetching Job (Every 5 minutes)
    node_cron_1.default.schedule('*/5 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Scheduler: Running contest data fetch job...`);
        await (0, contestService_1.fetchAndSaveContests)();
    }, {
        timezone: "Asia/Kolkata"
    });
    // 2. Notification/Calendar Job (Every 2 minutes)
    node_cron_1.default.schedule('*/2 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Scheduler: Running notification check job...`);
        await (0, notificationService_1.checkAndScheduleAllNotifications)(); // Calls the logic in notificationService.ts
    }, {
        timezone: "Asia/Kolkata"
    });
    // 3. Email Sending Execution Job
    node_cron_1.default.schedule('*/1 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Scheduler: Running email execution job...`);
        await (0, notificationService_2.processPendingNotifications)();
    }, {
        timezone: "Asia/Kolkata"
    });
};
exports.startHackTrackScheduler = startHackTrackScheduler;

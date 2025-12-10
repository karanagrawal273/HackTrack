// scheduler.ts (Original, Correct Structure)

import { sendEmail } from '../utils/emailService'; 
import cron from 'node-cron';
import User from '../models/User';
import Contest from '../models/Contest';
import { fetchAndSaveContests } from '../services/contestService';
import { checkAndScheduleAllNotifications } from '../services/notificationService';
import { processPendingNotifications } from '../services/notificationService';

export const startHackTrackScheduler = () => {
    // 1. Contest Data Fetching Job (Every 5 minutes)
    cron.schedule('*/5 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Scheduler: Running contest data fetch job...`);
        await fetchAndSaveContests();
    }, {
        timezone: "Asia/Kolkata"
    });

    // 2. Notification/Calendar Job (Every 2 minutes)
    cron.schedule('*/2 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Scheduler: Running notification check job...`);
        await checkAndScheduleAllNotifications(); // Calls the logic in notificationService.ts
    }, {
        timezone: "Asia/Kolkata"
    });

    // 3. Email Sending Execution Job
    cron.schedule('*/1 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Scheduler: Running email execution job...`);
        await processPendingNotifications();
    }, {
        timezone: "Asia/Kolkata"
    });
};
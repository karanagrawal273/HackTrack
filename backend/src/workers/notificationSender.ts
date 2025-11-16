import cron from 'node-cron';
import Notification from '../models/notification.model';
import { sendContestReminderEmail } from '../utils/mailer';
import { IUser } from '../models/user.model';
import { IContest } from '../models/contest.model';

export const startNotificationSenderCron = () => {
  // console.log('Setting up cron job for sending notifications...');

  cron.schedule('* * * * *', async () => {
    try {
      // console.log("Notification Sender Cron functions runs");
      const notificationsToSend = await Notification.find({
        status: 'pending',
        sendTime: { $lte: new Date() }
      }).populate('user').populate('contest');

      for (const notification of notificationsToSend) {
        const user = notification.user as unknown as IUser;
        const contest = notification.contest as unknown as IContest;
        if (user && contest) {
          const now = new Date();
          if (new Date(contest.startTime) <= now) {
            // console.log(`Skipping notification for ${contest.name} because it has already started.`);
            notification.status = 'failed'; // Or you could add a 'cancelled' status
            await notification.save();
            continue;
          }
          await sendContestReminderEmail(user, contest);
          notification.status = 'sent';
          await notification.save();
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  // console.log('✅ Notification sender cron job scheduled successfully.');
};
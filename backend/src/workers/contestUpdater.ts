import cron from 'node-cron';
import { fetchAndSaveContests } from '../services/contest.service';

// This function will set up and start the cron job
export const startContestUpdaterCron = () => {
  // console.log("Setting up cron job for contest updates...");

  cron.schedule('*/10 * * * *', async () => {
    // console.log('Running scheduled job: Fetching and saving contests...');
    try {
      await fetchAndSaveContests();
      // console.log('Scheduled job finished successfully.');
    } catch (error) {
      console.error(error);
    }
  });

  // console.log("✅ Cron job scheduled successfully.");
};
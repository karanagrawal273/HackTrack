import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import connectDB from './config/db';
import userRoutes from './routes/user.routes'
import contestRoutes from './routes/contest.routes'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { startContestUpdaterCron } from './workers/contestUpdater';
import { startNotificationSenderCron } from './workers/notificationSender';
import { scheduleNotificationsForContest } from './services/notification.service';
import { fetchAndSaveContests } from './services/contest.service';

// Connect to the database
connectDB();
// fetchAndSaveContests();
startContestUpdaterCron();
startNotificationSenderCron();
// scheduleNotificationsForContest();

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: process.env.FRONTEND_URL, // Your frontend URL
  credentials: true, // Allows cookies to be sent
};

app.use(cors(corsOptions));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// A simple test route to make sure server is running
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API is running with Mongoose!' });
});

app.use('/api/users',userRoutes);
app.use('/api/contests', contestRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
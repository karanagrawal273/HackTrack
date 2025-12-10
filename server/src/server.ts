// src/server.ts
import * as dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response } from 'express';
import connectDB from './db';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import calendarRoutes from './routes/calendar';
import contestRoutes from './routes/contest';
import { startHackTrackScheduler } from './utils/scheduler';
import cors from 'cors';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));

// Middleware
app.use(express.json());
startHackTrackScheduler();

// --- Mount Routers ---
// The base API path for authentication routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/contests', contestRoutes);

// Simple root route
app.get('/', (req: Request, res: Response) => {
  res.send('HackTrack Server Running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
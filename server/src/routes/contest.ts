// src/routes/contest.ts

import express from 'express';
import { protect } from '../middleware/auth';
import { getContests } from '../controllers/contestController';

const router = express.Router();

// Apply protection middleware to all routes in this router
router.use(protect); 

// GET /api/v1/contests
router.get('/', getContests);

export default router;
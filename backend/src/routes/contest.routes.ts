import { Router } from 'express';
import { getContests } from '../controllers/contest.controller';
import { protectRoute } from '../middleware/auth.middleware';

const router = Router();

// GET /api/contests
// This is a protected route. The `protectRoute` middleware will run first.
// If the user is authenticated, it will pass control to the `getContests` controller.
router.get('/', protectRoute, getContests);

export default router;
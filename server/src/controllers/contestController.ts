// src/controllers/contestController.ts

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Contest from '../models/Contest';
import User from '../models/User';

/**
 * @desc Get contests filtered by user's preferred platforms, sorted by date.
 * @route GET /api/v1/contests
 * @access Private
 */
export const getContests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized, user ID missing.' });
    }

    // 1. Fetch user to get their preferences
    const user = await User.findById(userId).select('preferredPlatforms'); 

    if (!user) {
      // Use a default list if user is found but preferences aren't (shouldn't happen with defaults)
      const defaultPlatforms = ['Codeforces', 'CodeChef', 'LeetCode', 'AtCoder'];
      return res.status(200).json([]); // Return empty if user isn't found
    }

    const preferredPlatforms = user.preferredPlatforms;

    // 2. Query MongoDB: Filter by future contests and user's preferred platforms
    const now = new Date();
    // console.log(`Fetching contests for platforms: ${user.preferredPlatforms.join(', ')}`);
    const contests = await Contest.find({
      // 🚨 Ensure the contest has not ended (or is ongoing)
      endTime: { $gt: now }, 
      // Filter contests whose platform is in the user's preferredPlatforms array
      platform: { $in: preferredPlatforms }, 
    })
    // 3. Sort by startTime ascending (date-wise order)
    .sort({ startTime: 1 }) 
    .lean(); // Use .lean() for faster query performance

    res.status(200).json(contests);

  } catch (error) {
    console.error('Error fetching filtered contests:', error);
    res.status(500).json({ success: false, error: 'Server error fetching contests.' });
  }
};
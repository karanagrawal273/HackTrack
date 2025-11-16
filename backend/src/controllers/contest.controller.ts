import { Request, Response } from 'express';
import Contest from '../models/contest.model';

export const getContests = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Get the user's tracked platforms from their profile
    const trackedPlatforms = user.trackedPlatforms;

    // console.log("Filtering contests for user:", user.email, "using platforms:", trackedPlatforms);

    // Find all contests that meet the criteria:
    // 1. The platform is in the user's trackedPlatforms list.
    // 2. The contest is starting in the future.
    const upcomingContests = await Contest.find({
      platform: { $in: trackedPlatforms },
      startTime: { $gte: new Date() },
    }).sort({ startTime: 'asc' }); // Sort by the soonest starting time

    res.status(200).json(upcomingContests);

  } catch (error) {
    // console.error("Error fetching contests for user:", error);
    res.status(500).json({ message: 'Server error while fetching contests.' });
  }
};
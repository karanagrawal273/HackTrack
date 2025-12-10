// src/controllers/userController.ts

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import User from '../models/User';

/**
 * @desc Update User Preferences
 * @route PUT /api/v1/user/preferences
 * @access Private
 */
export const updatePreferences = async (req: AuthenticatedRequest, res: Response) => {
  const { preferredPlatforms, calendarSync } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { preferredPlatforms, calendarSync },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(400).json({ success: false, error: 'Invalid data or Server Error' });
  }
};
// src/routes/user.ts

import express from 'express';
import { protect, AuthenticatedRequest } from '../middleware/auth';
import { updatePreferences } from '../controllers/userController';
import { syncNotificationsForUser } from '../services/notificationService'; // Assumed import
import User from '../models/User';

const router = express.Router();

router.use(protect); 
router.put('/preferences', updatePreferences);

router.post('/sync-history', protect, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        // Call the service function to initiate the bulk sync
        await syncNotificationsForUser(user); 

        res.status(200).json({ success: true, message: 'Historical sync initiated.' });

    } catch (error) {
        console.error('Error initiating historical sync:', error);
        res.status(500).json({ success: false, error: 'Failed to initiate sync.' });
    }
});

export default router;
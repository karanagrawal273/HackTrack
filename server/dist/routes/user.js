"use strict";
// src/routes/user.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
const notificationService_1 = require("../services/notificationService"); // Assumed import
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.use(auth_1.protect);
router.put('/preferences', userController_1.updatePreferences);
router.post('/sync-history', auth_1.protect, async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }
        // Call the service function to initiate the bulk sync
        await (0, notificationService_1.syncNotificationsForUser)(user);
        res.status(200).json({ success: true, message: 'Historical sync initiated.' });
    }
    catch (error) {
        console.error('Error initiating historical sync:', error);
        res.status(500).json({ success: false, error: 'Failed to initiate sync.' });
    }
});
exports.default = router;

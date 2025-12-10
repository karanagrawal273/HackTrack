"use strict";
// src/controllers/userController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferences = void 0;
const User_1 = __importDefault(require("../models/User"));
/**
 * @desc Update User Preferences
 * @route PUT /api/v1/user/preferences
 * @access Private
 */
const updatePreferences = async (req, res) => {
    const { preferredPlatforms, calendarSync } = req.body;
    try {
        const user = await User_1.default.findByIdAndUpdate(req.user?.id, { preferredPlatforms, calendarSync }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error('Error updating preferences:', error);
        res.status(400).json({ success: false, error: 'Invalid data or Server Error' });
    }
};
exports.updatePreferences = updatePreferences;

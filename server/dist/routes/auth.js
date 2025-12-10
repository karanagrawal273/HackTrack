"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController"); // Import all controller functions
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @desc    Register new user
// @route   POST /api/v1/auth/register
router.post('/register', authController_1.register);
// @desc    Verify user email with OTP
// @route   POST /api/v1/auth/verify
router.post('/verify', authController_1.verifyEmail);
// @desc    Login user
// @route   POST /api/v1/auth/login
router.post('/login', authController_1.login);
// @desc    Forgot Password - Send reset OTP
// @route   POST /api/v1/auth/forgotpassword
router.post('/forgotpassword', authController_1.forgotPassword);
// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resetToken
router.put('/resetpassword/:resetToken', authController_1.resetPassword);
router.get('/me', auth_1.protect, authController_1.getMe);
exports.default = router;

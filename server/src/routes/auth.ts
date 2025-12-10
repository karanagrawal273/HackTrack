import express from 'express';
import { 
  register, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  getMe
} from '../controllers/authController'; // Import all controller functions
import User from '../models/User';
import { protect, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// @desc    Register new user
// @route   POST /api/v1/auth/register
router.post('/register', register);

// @desc    Verify user email with OTP
// @route   POST /api/v1/auth/verify
router.post('/verify', verifyEmail);

// @desc    Login user
// @route   POST /api/v1/auth/login
router.post('/login', login);

// @desc    Forgot Password - Send reset OTP
// @route   POST /api/v1/auth/forgotpassword
router.post('/forgotpassword', forgotPassword);

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resetToken
router.put('/resetpassword/:resetToken', resetPassword);

router.get('/me', protect, getMe);

export default router;
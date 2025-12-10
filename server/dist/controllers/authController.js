"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyEmail = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User")); // Assuming User model path
const emailService_1 = require("../utils/emailService"); // Assuming email service path
const otpGenerator_1 = require("../utils/otpGenerator"); // We'll define this helper function next
const dotenv_1 = __importDefault(require("dotenv"));
// import { createCalendarEvent } from '../utils/calendarService'; // Placeholder for future calendar logic
dotenv_1.default.config();
// --- Helper Functions and Constants ---
// Generate a JWT token
const getSignedToken = (id, userName) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not defined in environment variables.');
    }
    // FIX: Convert the id (which is often a Mongoose ObjectId) to a string
    const userIdString = id.toString();
    const options = {
        expiresIn: (process.env.JWT_EXPIRE || '30d'),
    };
    // Pass the converted string ID to the payload
    return jsonwebtoken_1.default.sign({
        id: userIdString,
        name: userName
    }, // <-- Use the converted string here
    secret, options);
};
// --- Controller Methods ---
/**
 * @desc Register a new user and send verification email
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // 1. Check if user already exists
        let user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        // 2. Hash password (done via Mongoose pre-save hook in the User Model)
        // 3. Generate OTP and expiry time
        const otp = (0, otpGenerator_1.generateOTP)();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        // 4. Create User (unverified)
        user = await User_1.default.create({
            name,
            email,
            password,
            emailVerificationToken: otp,
            emailVerificationTokenExpire: otpExpiry,
        });
        // 5. Send Verification Email using Gmail API
        const emailSubject = 'HackTrack Account Verification OTP';
        const emailBody = `
      <h1>Welcome to HackTrack!</h1>
      <p>Please use the following One-Time Password (OTP) to verify your account:</p>
      <h2 style="color: #4CAF50;">${otp}</h2>
      <p>This code is valid for 10 minutes.</p>
    `;
        await (0, emailService_1.sendEmail)(email, emailSubject, emailBody);
        res.status(201).json({
            success: true,
            data: 'User registered. Please check your email for OTP verification.',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error during registration' });
    }
};
exports.register = register;
/**
 * @desc Verify user email with OTP
 * @route POST /api/v1/auth/verify
 * @access Public
 */
const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, error: 'Email already verified' });
        }
        // 1. Check OTP expiry
        if (!user.emailVerificationTokenExpire || user.emailVerificationTokenExpire < new Date()) {
            return res.status(400).json({ success: false, error: 'OTP expired. Please request a new one.' });
        }
        // 2. Compare OTP
        // We assume the OTP in the model is HASHED or stored securely.
        // **NOTE**: Since OTPs are short-lived, for simplicity and to avoid hash complexity, we often store them in plaintext for short periods.
        // If you stored it plaintext, use `user.emailVerificationToken !== otp`.
        // If you HASHED it, use `await bcrypt.compare(otp, user.emailVerificationToken)`
        const isMatch = user.emailVerificationToken === otp; // Assuming plaintext OTP for simplicity
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid OTP' });
        }
        // 3. Verification Success
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpire = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            token: getSignedToken(user._id, user.name),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error during verification' });
    }
};
exports.verifyEmail = verifyEmail;
/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }
    try {
        const user = await User_1.default.findOne({ email }).select('+password'); // Select password field
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        // Check password
        const isMatch = await user.matchPassword(password); // Assuming this method is on the User Model
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        // Check verification status
        if (!user.isVerified) {
            return res.status(401).json({ success: false, error: 'Email not verified. Please verify your account.' });
        }
        res.status(200).json({
            success: true,
            token: getSignedToken(user._id, user.name),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error during login' });
    }
};
exports.login = login;
/**
 * @desc Forgot Password - Send reset link/OTP
 * @route POST /api/v1/auth/forgotpassword
 * @access Public
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            // Send success response regardless of user existence for security reasons
            return res.status(200).json({ success: true, data: 'If a user with that email exists, a password reset link has been sent.' });
        }
        // 1. Generate Reset Token (OTP or a long string)
        const resetToken = (0, otpGenerator_1.generateOTP)(); // Using OTP for simplicity here
        const resetTokenExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetTokenExpire;
        await user.save({ validateBeforeSave: false }); // Skip password validation on save
        // 2. Send Reset Email
        const clientUrl = process.env.FRONTEND_URL;
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
        const emailBody = `
      <h1>HackTrack Password Reset</h1>
      <p>You requested a password reset. Click the link:</p>
      <p><a href="${resetUrl}">Reset Your Password Now</a></p>
      <p>This link is valid for 15 minutes.</p>
    `;
        await (0, emailService_1.sendEmail)(user.email, 'HackTrack Password Reset Request', emailBody);
        res.status(200).json({
            success: true,
            data: 'Password reset OTP sent to email.',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error during password reset request' });
    }
};
exports.forgotPassword = forgotPassword;
/**
 * @desc Reset Password
 * @route PUT /api/v1/auth/resetpassword/:resetToken
 * @access Public
 */
const resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;
    try {
        const user = await User_1.default.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpire: { $gt: new Date() }, // Check if token is not expired
        });
        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired password reset token' });
        }
        // 1. Set new password (Mongoose pre-save hook will hash it)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        // 2. Save user
        await user.save();
        res.status(200).json({
            success: true,
            data: 'Password successfully reset.',
            token: getSignedToken(user._id, user.name),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error during password reset' });
    }
};
exports.resetPassword = resetPassword;
const getMe = async (req, res) => {
    try {
        // req.user.id is attached by the protect middleware
        const user = await User_1.default.findById(req.user?.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        // Return the full user document (including preferences, name, email)
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error('Error fetching user data for /me:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getMe = getMe;

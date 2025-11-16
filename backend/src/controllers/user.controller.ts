import { Request, Response } from 'express';
import {Types} from 'mongoose'
import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import otpGenerator from 'otp-generator';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/mailer';
import generateTokenAndSetCookie from '../utils/generateToken';
import crypto from 'crypto';
import {google} from 'googleapis'
import { REPLCommand } from 'repl';
import { syncNotificationsForUser } from '../services/notification.service';
import * as dotenv from 'dotenv';

dotenv.config();

export const authUser = async (req:Request,res:Response)=>{
    res.send("Hello from verify");
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPass } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    let user = await User.findOne({ email });

    // Generate a 6-digit OTP
    const otp = otpGenerator.generate(6, { 
      upperCaseAlphabets: false, 
      specialChars: false, 
      lowerCaseAlphabets: false 
    });

    // Hash the password 🔐
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user already exists
    if (user && user.isVerified) {
      return res.status(409).json({ message: 'User with this email already exists and is verified.' });
      // You might want to update password if they re-register
    }
    else if(user){
      user.password=hashedPassword;
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
      await user.save();

      // Send the OTP email
      await sendOTPEmail(user.email, otp);
      return res.status(200).json({ message: 'Your account is already registered but not verified. A new OTP has been sent to your email for verification.' });
    }

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await user.save();

    // Send the OTP email
    await sendOTPEmail(user.email, otp);
    
    res.status(201).json({ 
      message: 'Registration successful. Please check your email for an OTP to verify your account.' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Verification successful
    user.isVerified = true;
    user.otp = undefined; // Clear OTP fields
    user.otpExpires = undefined;
    await user.save();

    await syncNotificationsForUser(user);

    // Generate token and set cookie
    generateTokenAndSetCookie(user._id as Types.ObjectId, res);

    // Here you would typically generate a JWT token for the user to log in
    res.status(200).json({ message: 'Account verified successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP verification.', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required.' });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    
    if (!user.isVerified) {
      const otp = otpGenerator.generate(6, { 
      upperCaseAlphabets: false, 
      specialChars: false, 
      lowerCaseAlphabets: false 
    });
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOTPEmail(user.email, otp);
      
      return res.status(403).json({ message: 'Please verify your email. A new OTP has been sent.' });
    }

    // Handle verified user
    generateTokenAndSetCookie(user._id as Types.ObjectId, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      trackedPlatforms:user.trackedPlatforms,
      profileLinks:user.profileLinks,
      isGoogleCalendarConnected: user.isGoogleCalendarConnected,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with that email address.' });
    }

    // 1. Generate a random token
    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase(); // Creates a 6-char token

    // 2. Hash the token and set expiry date
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // 3. Send the original (unhashed) token to the user's email
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({ message: 'Password reset token sent to email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    // 1. Hash the incoming token to match the one in the DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find the user by the hashed token and check expiry
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if token has not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 4. Clear the reset token fields
    user.passwordResetToken = "";
    user.passwordResetExpires ;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};

export const getMe = (req: Request, res: Response) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};

export const checkVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email as string });

    if (!user) {
      return res.status(404).json({ message: 'User does not registered. Please register first' });
    }

    res.status(200).json({ isVerified: user.isVerified });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout.', error });
  }
};

export const updateTrackedPlatforms = async (req: Request, res: Response) => {
  try {
    const { platforms } = req.body;
    const userId = req.user?._id;

    if (!Array.isArray(platforms)) {
      return res.status(400).json({ message: 'Platforms must be an array.' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, 
      { trackedPlatforms: platforms }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await syncNotificationsForUser(updatedUser);
    
    res.status(200).json({ message: 'Tracked platforms updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};

export const updateProfileLinks = async (req: Request, res: Response) => {
  try {
    const { profileLinks } = req.body;
    const userId = req.user?._id;

    if (!Array.isArray(profileLinks)) {
      return res.status(400).json({ message: 'Profile links must be an array.' });
    }
    
    await User.findByIdAndUpdate(userId, { profileLinks });
    res.status(200).json({ message: 'Profile links updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const connectGoogleCalendar = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication error, user not found.' });
  }
  const userId = req.user._id.toString();

  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Important to get a refresh token
    scope: scopes,
    state: userId,
    prompt: 'consent',
  });
  res.status(200).json({ url });
};

export const googleCalendarCallback = async (req: Request, res: Response) => {
  // console.log("--- Google Calendar Callback Initiated ---");
  const { code, state } = req.query;
  const userId = state as string;

  // console.log("Received code:", code);
  // console.log("Received state (userId):", userId);

  if (!userId) {
    // console.error("Callback failed: No userId in state parameter.");
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=auth_failed`);
  }

  try {
    // console.log("Exchanging authorization code for tokens...");
    const { tokens } = await oauth2Client.getToken(code as string);
    // console.log("Successfully received tokens from Google:", tokens);
    if (!tokens.refresh_token || !tokens.access_token) {
      // console.error("Token exchange failed: Did not receive refresh_token or access_token.");
      throw new Error('Failed to retrieve tokens from Google.');
    }

    // console.log(`Updating user ${userId} in the database...`);
    await User.findByIdAndUpdate(userId, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
      isGoogleCalendarConnected: true,
    });
    // console.log(`User ${userId} updated successfully!`);

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`); 
  } catch (error) {
    // console.error('Error handling Google Calendar callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=google_auth_failed`);
  }
};

export const disconnectGoogleCalendar = async (req: Request, res: Response) => {
  try {
    // Find the user and unset all Google-related fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          isGoogleCalendarConnected: false,
          googleAccessToken: undefined,
          googleRefreshToken: undefined,
        },
      },
      { new: true } // This option returns the updated document
    ).select('-password'); // Exclude the password

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(updatedUser); // Send back the updated user object
  } catch (error) {
    // console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
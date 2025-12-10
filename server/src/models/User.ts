import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';
// --- 1. Define the User Document Interface ---

/**
 * Interface for the User Document, extending Mongoose Document
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional because we use .select('+password') for login
  isVerified: boolean;
  
  // Email Verification Fields
  emailVerificationToken?: string;
  emailVerificationTokenExpire?: Date;
  
  // Password Reset Fields
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;

  // Notification Preferences (Placeholder for future features)
  preferredPlatforms: string[]; // e.g., ['codeforces', 'leetcode', 'topcoder']
  profileLinks: [];
  calendarSync: Boolean;
  googleRefreshToken: string;
  googleCalendarId: string;


  // Instance Methods
  matchPassword(enteredPassword: string): Promise<boolean>;
}


// --- 2. Define the User Schema ---

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Prevents password from being returned by default query
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  // Verification Fields
  emailVerificationToken: String,
  emailVerificationTokenExpire: Date,

  // Reset Fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Preferences
  preferredPlatforms: {
    type: [String],
    default: ['Codeforces', 'CodeChef', 'LeetCode', 'AtCoder', 'HackerRank', 'TopCoder'],
    required: true,
  },
  googleRefreshToken: {
    type: String, // Stores the permanent token used to generate new access tokens
    select: false, // CRITICAL: Never send this token to the client
  },
  googleCalendarId: {
    type: String, // ID of the calendar HackTrack creates/uses (e.g., primary or a new one)
  },
  calendarSync: {
    type: Boolean, // Whether to automatically add events
    default: false,
  },
  profileLinks: [ // Optional: For showing profile links in the navbar dropdown (if we bring it back)
    {
      platform: { type: String, required: true },
      url: { type: String, required: true },
    }
  ],
}, {
  timestamps: true,
});


// --- 3. Schema Middleware (Pre-save Hooks) ---

// Encrypt password before saving the user document
UserSchema.pre<IUser>('save', async function () { 
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    // We don't call next(), Mongoose proceeds automatically
    return;
  }
  
  // Generate salt and hash the new password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  
  // No need to call next() here either!
});

// NOTE: We do NOT hash the emailVerificationToken or resetPasswordToken here
// because the controller is currently designed to compare the raw OTP/Token for simplicity
// and due to their short lifespan. If you choose to hash them, update the controller logic!


// --- 4. Schema Methods ---

/**
 * Method to compare entered password with the hashed password in the database.
 * @param enteredPassword - The password string entered by the user.
 * @returns Promise<boolean>
 */
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  // Use the bcrypt compare function
  return await bcrypt.compare(enteredPassword, this.password!);
};


// --- 5. Create and Export the Model ---

/**
 * The Mongoose model for the User.
 */
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
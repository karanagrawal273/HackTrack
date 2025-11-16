import { Schema, model, Document, Types } from 'mongoose';
const validator = require("validator");

interface IProfileLink {
  platform: string;
  url: string;
}

// Define an interface representing a user document
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  isVerified: boolean;
  password?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  otp?: string;
  otpExpires?: Date;
  trackedPlatforms: string[];
  profileLinks: IProfileLink[];
  isGoogleCalendarConnected: boolean;
  googleAccessToken?: string;
  googleRefreshToken?: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate:[validator.isEmail,"Please fill the correct email"],
  },
  password: {
    type: String,
    required: true,
  },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  otp: { type: String, default:"" },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  trackedPlatforms: {
    type: [String],
    default: [],
  },
  profileLinks: [{
    platform: String,
    url: String,
  }],
  isGoogleCalendarConnected: { type: Boolean, default: false },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
}, {
  timestamps: true
});

const User = model<IUser>('User', userSchema);

export default User;
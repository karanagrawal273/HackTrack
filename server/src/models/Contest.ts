import mongoose, { Document, Schema, Model } from 'mongoose';

// --- 1. Define the Contest Document Interface ---

/**
 * Interface for the Contest Document
 */
export interface IContest extends Document {
  name: string;
  platform: 'Codeforces' | 'CodeChef' | 'LeetCode' | 'AtCoder' | 'TopCoder' | 'HackerRank';
  startTime: Date;
  endTime: Date;
  duration: number; // in milliseconds or seconds (consistent unit is key)
  url: string;
  contestId: string; // Unique ID from the external platform
  // Field to track if notifications have been scheduled for this contest
  isScheduled: boolean;
  createdAt: Date; 
  updatedAt: Date;
}


// --- 2. Define the Contest Schema ---

const ContestSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Contest must have a name'],
    trim: true,
  },
  platform: {
    type: String,
    required: [true, 'Contest must have a platform'],
    enum: ['Codeforces', 'CodeChef', 'LeetCode', 'AtCoder', 'TopCoder', 'HackerRank'],
  },
  startTime: {
    type: Date,
    required: [true, 'Contest must have a start time'],
    index: true, // Indexing to efficiently query upcoming contests
  },
  endTime: {
    type: Date,
    required: [true, 'Contest must have an end time'],
  },
  duration: {
    type: Number,
    required: [true, 'Contest duration is required'],
  },
  url: {
    type: String,
    required: [true, 'Contest URL is required'],
  },
  contestId: {
    type: String,
    required: [true, 'External Contest ID is required'],
    unique: true, // Prevents duplicate entries from repeated fetching
  },
  isScheduled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});


// --- 3. Create and Export the Model ---

/**
 * The Mongoose model for the Contest.
 */
const Contest: Model<IContest> = mongoose.model<IContest>('Contest', ContestSchema);

export default Contest;
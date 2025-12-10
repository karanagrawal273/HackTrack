"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// --- 2. Define the User Schema ---
const UserSchema = new mongoose_1.Schema({
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
    profileLinks: [
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
UserSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        // We don't call next(), Mongoose proceeds automatically
        return;
    }
    // Generate salt and hash the new password
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
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
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // Use the bcrypt compare function
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
// --- 5. Create and Export the Model ---
/**
 * The Mongoose model for the User.
 */
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;

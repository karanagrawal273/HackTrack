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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// --- 2. Define the Contest Schema ---
const ContestSchema = new mongoose_1.Schema({
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
const Contest = mongoose_1.default.model('Contest', ContestSchema);
exports.default = Contest;

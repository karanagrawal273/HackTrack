"use strict";
// src/services/contestService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndSaveContests = void 0;
const axios_1 = __importDefault(require("axios"));
const Contest_1 = __importDefault(require("../models/Contest"));
const CalendarEvent_1 = __importDefault(require("../models/CalendarEvent"));
// Use environment variables for clist.by authentication
const CLIST_API_URL = process.env.CLIST_API_URL || 'https://clist.by/api/v4/contest/';
const CLIST_USERNAME = process.env.CLIST_USERNAME;
const CLIST_API_KEY = process.env.CLIST_API_KEY;
// Mapping clist.by resource names to our internal platform names
const PLATFORM_MAP = {
    'codeforces.com': 'Codeforces',
    'codechef.com': 'CodeChef',
    'leetcode.com': 'LeetCode',
    'atcoder.jp': 'AtCoder',
    'topcoder.com': 'TopCoder',
    'hackerrank.com': 'HackerRank',
    // devpost.com is added but must be defined in IContest if used
};
// Platforms list derived from PLATFORM_MAP keys for the API query
const PLATFORMS_IN_QUERY = Object.keys(PLATFORM_MAP).join(',');
/**
 * Fetches contest data from clist.by API and saves/updates it in MongoDB.
 */
const fetchAndSaveContests = async () => {
    if (!CLIST_USERNAME || !CLIST_API_KEY) {
        console.error("CList API credentials are not defined in .env file.");
        return 0;
    }
    try {
        console.log('--- Starting clist.by contest data fetch ---');
        // --- Data Cleanup Logic (Placeholder for full implementation) ---
        // The previous implementation was simpler, but this is more comprehensive:
        const now = new Date();
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const finishedContests = await Contest_1.default.find({
            endTime: { $lt: hourAgo }
        }).select('_id');
        if (finishedContests.length > 0) {
            const finishedContestIds = finishedContests.map(c => c._id);
            // a. Delete associated CalendarEvent records
            const calendarDeleteResult = await CalendarEvent_1.default.deleteMany({
                contest: { $in: finishedContestIds }
            });
            // b. Delete the Contest records themselves
            const contestDeleteResult = await Contest_1.default.deleteMany({
                _id: { $in: finishedContestIds }
            });
            console.log(`[Contest Cleanup] Deleted ${contestDeleteResult.deletedCount} Contests, ${calendarDeleteResult.deletedCount} Calendar Events.`);
        }
        const response = await axios_1.default.get(CLIST_API_URL, {
            // FIX 1: Use official Authorization header for security and reliability
            headers: {
                'Authorization': `ApiKey ${CLIST_USERNAME}:${CLIST_API_KEY}`
            },
            params: {
                // FIX 2: Use clist.by's built-in 'upcoming' filter for simplicity
                upcoming: true,
                // We still use start__gte to catch any edge cases and reinforce the filter
                start__gte: new Date().toISOString(),
                // Filter by the platforms we support
                resource__in: PLATFORMS_IN_QUERY,
                order_by: 'start',
                limit: 100
            }
        });
        const contests = response.data.objects;
        let newContestCount = 0;
        for (const contestData of contests) {
            const resource = contestData.resource;
            const platform = PLATFORM_MAP[resource];
            // Ensure we only process known platforms
            if (!platform) {
                console.warn(`SKIPPING: Unknown platform resource: ${resource}.`);
                continue;
            }
            // FIX 3: Append 'Z' to treat the timestamp as UTC explicitly before conversion
            const startTime = new Date(contestData.start + 'Z');
            const endTime = new Date(contestData.end + 'Z');
            const durationMs = contestData.duration * 1000;
            const contestToSave = {
                name: contestData.event,
                platform: platform,
                startTime: startTime,
                endTime: endTime,
                duration: durationMs,
                url: contestData.href,
                contestId: contestData.id.toString(), // Use clist.by's reliable ID
            };
            // Upsert: Find by contestId (clist_id)
            const result = await Contest_1.default.findOneAndUpdate({ contestId: contestToSave.contestId }, // Query
            contestToSave, // Replacement document
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true // CRITICAL: Forces Mongoose to throw a proper error instead of failing silently
            });
        }
        console.log(`--- Finished fetching from clist.by. Added/Updated ${contests.length} contests.`);
        return newContestCount;
    }
    catch (error) {
        console.error('Error fetching or saving contests from clist.by:', error);
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('clist.by API Error Response:', error.response.data);
        }
        return 0;
    }
};
exports.fetchAndSaveContests = fetchAndSaveContests;

// src/types/index.ts

export interface IContest {
    _id: string;
    contestId: number;
    name: string;
    url: string;
    platform: string;
    startTime: string; // ISO string (UTC)
    endTime: string;   // ISO string (UTC)
    duration: number; // Duration in seconds
    notificationSent: boolean;
    __v: number;
}
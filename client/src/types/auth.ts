// src/types/auth.ts

export interface User {
    id: string;
    name: string;
    email: string;
    preferredPlatforms: string[]; // Array of strings (platform names)
    calendarSync: boolean; // For future calendar integration
    profileLinks?: { platform: string; url: string }[];
    googleRefreshToken?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface VerifyData {
    email: string;
    otp: string;
}

export interface ResetData {
    newPassword: string;
}
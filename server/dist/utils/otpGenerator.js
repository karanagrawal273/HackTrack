"use strict";
// src/utils/otpGenerator.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
/**
 * @desc Generates a 6-digit numeric OTP
 * @returns {string} The OTP as a string
 */
const generateOTP = () => {
    // Generate a random 6-digit number (100000 to 999999)
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
};
exports.generateOTP = generateOTP;

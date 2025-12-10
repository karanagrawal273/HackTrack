// src/utils/otpGenerator.ts

/**
 * @desc Generates a 6-digit numeric OTP
 * @returns {string} The OTP as a string
 */
export const generateOTP = (): string => {
  // Generate a random 6-digit number (100000 to 999999)
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};
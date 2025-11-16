import { Response } from 'express';
import { Types } from 'mongoose';
const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (userId: Types.ObjectId, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });

  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
    secure: true, // Cookie is only sent over HTTPS
    sameSite: 'strict', // CSRF protection
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days, should match your JWT expiry
  });
};

export default generateTokenAndSetCookie;
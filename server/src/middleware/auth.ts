// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Types } from 'mongoose';

// Extend the Request interface to include the user object
export interface AuthenticatedRequest extends Request {
    user?: {
        id: Types.ObjectId;
    };
}

/**
 * Middleware to protect routes: validates JWT and attaches user ID to the request.
 */
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. Check for JWT in the Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route. No token provided.' });
    }

    try {
        // 2. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

        // 3. Find user by ID (exclude password)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Not authorized, user not found.' });
        }

        // 4. Attach user ID to the request object
        req.user = { id: user._id };
        next();

    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ success: false, error: 'Not authorized, token failed.' });
    }
};
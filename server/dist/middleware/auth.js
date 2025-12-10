"use strict";
// src/middleware/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
/**
 * Middleware to protect routes: validates JWT and attaches user ID to the request.
 */
const protect = async (req, res, next) => {
    let token;
    // 1. Check for JWT in the Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route. No token provided.' });
    }
    try {
        // 2. Verify Token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 3. Find user by ID (exclude password)
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Not authorized, user not found.' });
        }
        // 4. Attach user ID to the request object
        req.user = { id: user._id };
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ success: false, error: 'Not authorized, token failed.' });
    }
};
exports.protect = protect;

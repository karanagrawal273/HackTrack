import { Router } from "express";
import {
  authUser,
  registerUser,
  verifyOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  checkVerificationStatus,
  logoutUser,
  updateTrackedPlatforms,
  updateProfileLinks,
  googleCalendarCallback,
  connectGoogleCalendar,
  disconnectGoogleCalendar
} from "../controllers/user.controller";
import { protectRoute } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  registerSchema,
  backendResetPasswordSchema,
} from "../lib/validationSchemas";

const router = Router();

router.get("/", authUser);

// Define the registration route
// POST /api/users/register
router.post("/register", validate(registerSchema), registerUser);

// POST /api/users/verify-otp
router.post("/verify-otp", verifyOTP);

//POST /api/users/login
router.post("/login", loginUser);

//POST /api/users/forgot-password
router.post("/forgot-password", forgotPassword);

//POST /api/users/reset-password
router.post(
  "/reset-password",
  validate(backendResetPasswordSchema),
  resetPassword
);

//GET /api/users/me
router.get("/me", protectRoute, getMe);

//GET /api/users/check-verification
router.get("/check-verification", checkVerificationStatus);

//POST /api/users/logout
router.post("/logout", logoutUser);

//PUT /api/users/preferences/platforms
router.put('/preferences/platforms', protectRoute, updateTrackedPlatforms);

//PUT /api/users/preferences/profiles
router.put('/preferences/profiles', protectRoute, updateProfileLinks);

router.get('/google-calendar/connect', protectRoute, connectGoogleCalendar);
router.get('/google-calendar/callback', googleCalendarCallback);
router.post('/google-calendar/disconnect',protectRoute, disconnectGoogleCalendar);

export default router;

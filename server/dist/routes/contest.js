"use strict";
// src/routes/contest.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const contestController_1 = require("../controllers/contestController");
const router = express_1.default.Router();
// Apply protection middleware to all routes in this router
router.use(auth_1.protect);
// GET /api/v1/contests
router.get('/', contestController_1.getContests);
exports.default = router;

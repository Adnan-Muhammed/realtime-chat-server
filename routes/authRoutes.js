// ═══════════════════════════════════════════════════════════════
// routes/authRoutes.js — Authentication Routes (Public)
//
// These routes do NOT require a JWT token.
//
// POST /api/auth/google-login   → Login/register with Google token
// POST /api/auth/update-profile → Save profile (name, phone, gender)
// POST /api/auth/refresh        → Exchange refresh token for new access token
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { googleLogin, updateProfile, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/google-login', googleLogin);
router.post('/update-profile', updateProfile);
router.post('/refresh', refreshToken);

export default router;
// ═══════════════════════════════════════════════════════════════
// routes/userRoutes.js — User & Friend Routes (Protected)
//
// All routes require JWT authentication (protect middleware).
//
// GET  /api/users/discover    → Get all users for discovery page
// GET  /api/users/friends     → Get current user's accepted friends
// POST /api/users/connection  → Send/accept/reject/withdraw friend request
// POST /api/users/fcm-token   → Save browser FCM token for push notifications
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { getUsers, getFriends, handleConnection, saveFcmToken } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT auth to ALL routes in this file
router.use(protect);

router.get('/discover', getUsers);
router.get('/friends', getFriends);
router.post('/connection', handleConnection);
router.post('/fcm-token', saveFcmToken);

export default router;


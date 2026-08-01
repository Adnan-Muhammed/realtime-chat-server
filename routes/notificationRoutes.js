// ═══════════════════════════════════════════════════════════════
// routes/notificationRoutes.js — Notification Routes
//
// GET /api/notifications/:userId          → Get all notifications for a user
// PUT /api/notifications/:userId/read     → Mark ALL notifications as read
// PUT /api/notifications/:id/mark-read    → Mark a SINGLE notification as read
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { getNotifications, markAllRead, markRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:userId', getNotifications);
router.put('/:userId/read', markAllRead);
router.put('/:id/mark-read', markRead);

export default router;

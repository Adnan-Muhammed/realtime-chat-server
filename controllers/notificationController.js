// ═══════════════════════════════════════════════════════════════
// controllers/notificationController.js — Notification Logic
//
// Handles:
//   getNotifications → Fetch notifications (auto-cleans old ones)
//   markAllRead      → Mark all user's notifications as read
//   markRead         → Mark a single notification as read
// ═══════════════════════════════════════════════════════════════

import Notification from '../models/Notification.js';

// ─── Get Notifications ───────────────────────────────────────
// Fetches up to 100 notifications for a user.
// Auto-deletes notifications older than 30 days to keep the DB clean.
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Auto-cleanup: remove notifications older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await Notification.deleteMany({ userId, createdAt: { $lt: thirtyDaysAgo } });

    // Fetch remaining notifications (newest first)
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Mark All Notifications as Read ──────────────────────────
export const markAllRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'Marked all as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Mark Single Notification as Read ────────────────────────
export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

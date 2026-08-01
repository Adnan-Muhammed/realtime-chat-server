// ═══════════════════════════════════════════════════════════════
// models/Notification.js — Notification Schema
//
// Stores notifications for friend requests and acceptances.
// Types: 'request' | 'accepted' | 'like'
// ═══════════════════════════════════════════════════════════════

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Who this notification is FOR
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },                  // Who TRIGGERED it
  type:     { type: String, required: true },   // 'request', 'accepted', or 'like'
  name:     { type: String, required: true },   // Sender's display name (for quick rendering)
  detail:   { type: String, required: true },   // e.g. "sent you a connect request"
  isRead:   { type: Boolean, default: false },  // Has the user seen this?
  time:     { type: String },                   // Formatted display time
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);

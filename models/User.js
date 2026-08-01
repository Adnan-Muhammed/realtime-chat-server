// ═══════════════════════════════════════════════════════════════
// models/User.js — User Schema
//
// Stores user account data from Google OAuth, profile info,
// and friend relationship arrays.
// ═══════════════════════════════════════════════════════════════

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // ─── Google Auth Fields ──────────────────────────────────────
  googleId:  { type: String, required: true, unique: true },  // Google's unique user ID
  email:     { type: String, required: true, unique: true },

  // ─── Profile Fields ──────────────────────────────────────────
  name:              { type: String, required: true },
  photoUrl:          { type: String },
  gender:            { type: String, default: '' },
  phone:             { type: String, default: '' },
  isProfileComplete: { type: Boolean, default: false },  // Set to true after first profile save

  // ─── Friend Relationships ────────────────────────────────────
  friends:                [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Accepted friends
  friendRequestsSent:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Outgoing pending requests
  friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Incoming pending requests
}, { timestamps: true });

export default mongoose.model('User', userSchema);
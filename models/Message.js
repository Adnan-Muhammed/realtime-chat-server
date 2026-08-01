// ═══════════════════════════════════════════════════════════════
// models/Message.js — Chat Message Schema
//
// Stores individual messages between two users in a chat room.
// The roomId is generated from both user IDs (sorted alphabetically).
// ═══════════════════════════════════════════════════════════════

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId:   { type: String, required: true },                                   // Chat room identifier
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Who sent this message
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Who receives this message
  text:     { type: String, required: true },                                   // Message content
  time:     { type: String },                                                   // Formatted display time
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);

// ═══════════════════════════════════════════════════════════════
// controllers/messageController.js — Chat Message Logic
//
// Handles:
//   getMessages → Fetch all messages in a chat room (sorted oldest first)
//   sendMessage → Save a new message to the database
// ═══════════════════════════════════════════════════════════════

import Message from '../models/Message.js';

// ─── Get Messages ────────────────────────────────────────────
// Fetches all messages for a given roomId, sorted by creation time.
// The roomId is generated on the frontend from two user IDs.
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Send Message ────────────────────────────────────────────
// Saves a new message to the database.
// Note: Real-time delivery is handled by Socket.io (socket.js),
// this endpoint is only for persisting the message.
export const sendMessage = async (req, res) => {
  try {
    const { roomId, sender, receiver, text, time } = req.body;

    const newMessage = await Message.create({ roomId, sender, receiver, text, time });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// socket.js — Socket.io Real-time Setup
// Handles live messaging between users via WebSocket
//
// Events:
//   join_room      → Client joins a chat room
//   send_message   → Client sends a message → server broadcasts it
//   receive_message → Server delivers message to room members
//   user_connected  → Tracks online users by their DB user ID
//   user_disconnected → Removes user from online tracker
// ═══════════════════════════════════════════════════════════════

import { Server } from 'socket.io';

let io;

// ─── Online Users Map ────────────────────────────────────────
// Maps userId (string) → socket.id so we can check who is online
// without touching the database.
const onlineUsers = new Map(); // userId → socketId

// ─── Initialize Socket.io ────────────────────────────────────
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // ─── Track online presence ──────────────────────────────
    // Frontend emits this event right after connecting, passing
    // the logged-in user's DB _id.
    socket.on('user_online', (userId) => {
      if (userId) {
        onlineUsers.set(userId.toString(), socket.id);
        console.log(`User ${userId} is now online (socket: ${socket.id})`);
      }
    });

    // User joins a specific chat room (roomId = sorted combination of two user IDs)
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // User sends a message → broadcast to room (and optionally to receiver directly)
    socket.on('send_message', (data) => {
      if (data.receiver) {
        socket.to(data.roomId).to(data.receiver).emit('receive_message', data);
      } else {
        socket.to(data.roomId).emit('receive_message', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      // Remove user from online map when their socket disconnects
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} is now offline`);
          break;
        }
      }
    });
  });

  return io;
};

// ─── Get Socket.io Instance ─────────────────────────────────
// Used by controllers (e.g., userController) to emit events
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// ─── Check if a user is currently online ────────────────────
// Returns true if the userId has an active socket connection.
// Used by userController before sending a push notification.
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
};

// ═══════════════════════════════════════════════════════════════
// socket.js — Socket.io Real-time Setup
// Handles live messaging between users via WebSocket
//
// Events:
//   join_room      → Client joins a chat room
//   send_message   → Client sends a message → server broadcasts it
//   receive_message → Server delivers message to room members
// ═══════════════════════════════════════════════════════════════

import { Server } from 'socket.io';

let io;

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

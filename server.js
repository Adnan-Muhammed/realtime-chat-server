// ═══════════════════════════════════════════════════════════════
// server.js — Main Entry Point
// Sets up Express, MongoDB, Socket.io, and mounts all API routes
// ═══════════════════════════════════════════════════════════════

import 'dotenv/config'; // MUST be the first import to load .env variables

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

// ─── Internal Imports ────────────────────────────────────────
import connectDB from './config/db.js';
import { initSocket } from './socket.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// ─── Configuration ───────────────────────────────────────────
connectDB();

// ─── App Setup ───────────────────────────────────────────────
const app = express();
const server = createServer(app);
initSocket(server);

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────
// Public routes  (no JWT needed)
app.use('/api/auth', authRoutes);

// Protected routes (JWT verified inside each route file)
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
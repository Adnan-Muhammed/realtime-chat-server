// ═══════════════════════════════════════════════════════════════
// routes/messageRoutes.js — Chat Message Routes
//
// GET  /api/messages/:roomId  → Get all messages in a chat room
// POST /api/messages/         → Save a new message to the database
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/:roomId', getMessages);
router.post('/', sendMessage);

export default router;

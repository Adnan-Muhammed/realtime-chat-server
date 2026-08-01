// ═══════════════════════════════════════════════════════════════
// config/db.js — MongoDB Connection
// Connects to MongoDB using the MONGO_URI from .env
// ═══════════════════════════════════════════════════════════════

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    process.exit(1); // Stop server if DB connection fails
  }
};

export default connectDB;
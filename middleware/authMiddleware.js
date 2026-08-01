// ═══════════════════════════════════════════════════════════════
// middleware/authMiddleware.js — JWT Authentication Guard
//
// How it works:
//   1. Extracts the JWT from "Authorization: Bearer <token>" header
//   2. Verifies the token using JWT_SECRET
//   3. If valid   → attaches user data to req.user and calls next()
//   4. If expired → returns 401 with "token_expired" (frontend auto-refreshes)
//   5. If invalid → returns 401 with error message
// ═══════════════════════════════════════════════════════════════

import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  // Step 1: Check if Authorization header exists
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  // Step 2: Extract and verify the token
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Attach decoded user data (contains user id) to the request
    req.user = decoded;
    next();
  } catch (error) {
    // Step 4: Handle specific error types
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'token_expired' });
    }
    console.error('JWT Verification failed:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

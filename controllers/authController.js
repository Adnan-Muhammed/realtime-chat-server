// ═══════════════════════════════════════════════════════════════
// controllers/authController.js — Authentication Logic
//
// Handles:
//   googleLogin    → Verify Google access token, create/find user, issue JWTs
//   updateProfile  → Save user's profile details (name, phone, gender)
//   refreshToken   → Exchange refresh token for a new access token
// ═══════════════════════════════════════════════════════════════

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── Google Login ────────────────────────────────────────────
// Flow:
//   1. Frontend sends Google access_token
//   2. We verify it by fetching user info from Google's API
//   3. Find or create user in our database
//   4. Generate our own JWT access + refresh tokens
//   5. Send tokens + user data back to frontend
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////// GOOGLE AUTH: ACCESS TOKEN VERIFICATION ///////////////////////
    // 3. We receive the Access Token from the frontend.
    // 4. We use a standard fetch to Google's /userinfo endpoint to get the profile.
    //    This does NOT require a Client Secret, just the token!
    ////////////////////////////////////////////////////////////////////////////////
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    if (!googleRes.ok) {
      throw new Error('Failed to fetch user profile from Google');
    }

    const payload = await googleRes.json();

    // Find existing user or create new one
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        photoUrl: payload.picture,
      });
    }

    // Generate JWT tokens for session management
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign(
      { id: user._id },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user,
      isNewUser: !user.isProfileComplete
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// ─── Update Profile ──────────────────────────────────────────
// Called after first login to complete the user's profile.
// Sets isProfileComplete to true so the user skips this step next time.
export const updateProfile = async (req, res) => {
  try {
    const { userId, name, gender, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, gender, phone, isProfileComplete: true },
      { new: true }  // Return the updated document (not the old one)
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
};

// ─── Refresh Token ───────────────────────────────────────────
// When the access token expires (after 15 min), the frontend
// automatically calls this endpoint with the refresh token
// to get a new access token without requiring re-login.
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // Verify the refresh token
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, refreshTokenSecret);

    // Ensure the user still exists in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Issue a new access token
    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
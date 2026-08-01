// ═══════════════════════════════════════════════════════════════
// config/firebaseAdmin.js — Firebase Admin SDK Initialization
//
// Initializes the firebase-admin app using service account credentials
// stored in environment variables. The private key's escaped newlines
// (\n) are replaced with real newlines so firebase-admin accepts it.
// ═══════════════════════════════════════════════════════════════

import admin from 'firebase-admin';
 
// Only initialize once (prevents re-init errors in hot-reload envs)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // .env files store the private key with literal \n — replace them with real newlines
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;

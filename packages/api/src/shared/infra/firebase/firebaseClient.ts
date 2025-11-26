/**
 * @file firebaseClient.ts
 * @module Shared/Infrastructure/Firebase
 * @layer Infrastructure
 * @description Firebase Admin SDK Client Initialization
 * 
 * Initializes the Firebase Admin SDK for server-side authentication verification.
 * This client is used to verify Firebase ID tokens sent from the Flutter frontend.
 * 
 * **Responsibilities:**
 * - Initialize Firebase Admin SDK with service account credentials
 * - Provide singleton instance to prevent multiple initializations
 * - Export auth instance for token verification across the application
 * 
 * **Environment Dependencies:**
 * - FIREBASE_PROJECT_ID: Google Cloud project ID
 * - FIREBASE_CLIENT_EMAIL: Service account email
 * - FIREBASE_PRIVATE_KEY: Service account private key (with escaped newlines)
 * 
 * **Used By:**
 * - verifyAuth.middleware.ts: Token verification middleware
 * - Any module requiring Firebase authentication
 * 
 * @example
 * import { firebaseAuth } from './firebaseClient';
 * const decodedToken = await firebaseAuth.verifyIdToken(idToken);
 */

import admin from 'firebase-admin';
import { envConfig } from '../../config/env.config';

/**
 * Initialize Firebase Admin SDK
 * 
 * Uses singleton pattern to ensure only one Firebase app is initialized.
 * Credentials are loaded from environment variables.
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: envConfig.firebase.projectId,
      clientEmail: envConfig.firebase.clientEmail,
      // Replace escaped newlines in private key
      privateKey: envConfig.firebase.privateKey?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Firebase Auth Instance
 * 
 * Singleton instance for verifying Firebase ID tokens.
 * 
 * @example
 * // Verify a token
 * try {
 *   const decoded = await firebaseAuth.verifyIdToken(token);
 *   console.log('User ID:', decoded.uid);
 * } catch (error) {
 *   console.error('Invalid token');
 * }
 */
export const firebaseAuth = admin.auth();

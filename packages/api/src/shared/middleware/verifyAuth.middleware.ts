/**
 * @file verifyAuth.middleware.ts
 * @module Shared/Middleware
 * @layer Infrastructure
 * @description Firebase Authentication Middleware
 * 
 * Verifies Firebase ID tokens from Flutter frontend and attaches user info to request.
 * This replaces the old JWT-based authentication system.
 * 
 * **Responsibilities:**
 * - Extract Firebase ID token from Authorization header
 * - Verify token using Firebase Admin SDK
 * - Attach decoded user info (uid, email, name) to request
 * - Return 401 for invalid/expired tokens
 * 
 * **Security:**
 * - Tokens are verified against Firebase servers (stateless)
 * - No need for token blacklisting (Firebase handles expiration)
 * - Supports email/password, Google, and Apple sign-in from Flutter
 * 
 * **Used By:**
 * - Protected routes in auth, community, chat, appointments modules
 * 
 * @example
 * import { verifyAuth } from './verifyAuth.middleware';
 * router.get('/protected', verifyAuth, controller.method);
 */

import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../infra/firebase/firebaseClient";

/**
 * Extended Express Request with Firebase user info
 */
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    firebaseUid?: string; // Alias for compatibility
  };
}

/**
 * Verify Firebase ID Token Middleware
 * 
 * Extracts and verifies Firebase ID token from Authorization header.
 * Attaches decoded user information to req.user for downstream use.
 * 
 * @param {AuthRequest} req - Express request with user property
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 * 
 * @throws {401} Missing Authorization header
 * @throws {401} Invalid or expired Firebase token
 * 
 * @example
 * // In routes
 * router.post('/create-post', verifyAuth, postController.create);
 * 
 * // In controller
 * const userId = req.user?.uid; // Firebase user ID
 */
export const verifyAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token not provided",
      });
      return;
    }

    // Verify Firebase ID token
    // checkRevoked: true ensures tokens issued before signout are rejected
    const decodedToken = await firebaseAuth.verifyIdToken(token, true);

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0],
      firebaseUid: decodedToken.uid, // Alias for compatibility
    };

    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * @file socketAuth.middleware.ts
 * @module Chat/Infrastructure/WebSocket
 * @layer Infrastructure
 * @description Socket.IO Authentication Middleware - Firebase token verification
 */

import { Socket } from 'socket.io';
import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  firebaseUid?: string;
}

/**
 * Socket.IO authentication middleware
 * Verifies Firebase token from handshake auth
 */
export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(token, true);

    // Get database user ID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user info to socket
    socket.userId = user.id;
    socket.firebaseUid = decodedToken.uid;

    next();
  } catch (error) {
    console.error('Socket authentication failed:', error);
    next(new Error('Invalid or expired token'));
  }
};

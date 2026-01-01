/**
 * @file fcmNotification.service.ts
 * @module Shared/Infrastructure/FCM
 * @layer Infrastructure
 * @description Firebase Cloud Messaging Service for Push Notifications
 * 
 * Responsibilities:
 * - Fetch active push tokens for users
 * - Send push notifications via Firebase Admin SDK
 * - Fail silently with logging only
 * - Non-blocking notification delivery
 */

import admin from 'firebase-admin';
import { prisma } from '../prisma/prismaClient';

export interface FCMNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: {
    type: string;
    entityId: string;
    [key: string]: string;
  };
}

export class FCMNotificationService {
  /**
   * Send push notification to a user
   * Fetches all active tokens and sends to all devices
   * Fails silently - logs errors but doesn't throw
   */
  async sendNotification(payload: FCMNotificationPayload): Promise<void> {
    try {
      // Fetch active FCM tokens for the user
      const tokens = await this.getActiveTokens(payload.userId);

      if (tokens.length === 0) {
        console.log(`[FCM] No active tokens found for user: ${payload.userId}`);
        return;
      }

      // Prepare FCM message
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        tokens: tokens,
      };

      // Send notification to all user devices
      const response = await admin.messaging().sendEachForMulticast(message);

      // Log results
      console.log(`[FCM] Sent ${response.successCount}/${tokens.length} notifications to user: ${payload.userId}`);

      // Handle failed tokens (invalid/unregistered)
      if (response.failureCount > 0) {
        await this.handleFailedTokens(response, tokens, payload.userId);
      }
    } catch (error) {
      // Fail silently - notification failures should never break main flow
      console.error('[FCM] Failed to send notification:', error);
    }
  }

  /**
   * Fetch active push tokens for a user
   */
  private async getActiveTokens(userId: string): Promise<string[]> {
    try {
      const pushTokens = await prisma.pushToken.findMany({
        where: {
          userId,
          isActive: true,
          deletedAt: null,
        },
        select: {
          token: true,
        },
      });

      return pushTokens.map(pt => pt.token);
    } catch (error) {
      console.error('[FCM] Failed to fetch tokens:', error);
      return [];
    }
  }

  /**
   * Handle failed token sends (deactivate invalid tokens)
   */
  private async handleFailedTokens(
    response: admin.messaging.BatchResponse,
    tokens: string[],
    userId: string
  ): Promise<void> {
    try {
      const failedTokens: string[] = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          
          // Deactivate tokens that are invalid or unregistered
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      // Deactivate invalid tokens
      if (failedTokens.length > 0) {
        await prisma.pushToken.updateMany({
          where: {
            userId,
            token: { in: failedTokens },
          },
          data: {
            isActive: false,
          },
        });

        console.log(`[FCM] Deactivated ${failedTokens.length} invalid tokens for user: ${userId}`);
      }
    } catch (error) {
      console.error('[FCM] Failed to handle failed tokens:', error);
    }
  }

  /**
   * Send notification to multiple users
   * Useful for batch notifications
   */
  async sendNotificationToMultipleUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: { type: string; entityId: string; [key: string]: string }
  ): Promise<void> {
    // Send notifications in parallel (non-blocking)
    const promises = userIds.map(userId =>
      this.sendNotification({ userId, title, body, data })
    );

    // Wait for all to complete (but don't throw on individual failures)
    await Promise.allSettled(promises);
  }
}

/**
 * Singleton instance
 */
export const fcmNotificationService = new FCMNotificationService();

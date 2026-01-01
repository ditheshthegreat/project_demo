/**
 * @file chatNotification.service.ts
 * @module Chat/Infrastructure/Notifications
 * @layer Infrastructure
 * @description Chat Push Notification Service using FCM
 */

import admin from 'firebase-admin';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class ChatNotificationService {
  /**
   * Send push notification for new chat message
   * Only notifies offline users (not the sender)
   */
  async sendMessageNotification(input: {
    messageId: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string | null;
    messageType: string;
  }): Promise<void> {
    try {
      // Get all participants except sender
      const participants = await prisma.conversationParticipant.findMany({
        where: {
          conversationId: input.conversationId,
          userId: { not: input.senderId },
        },
        select: { userId: true },
      });

      if (participants.length === 0) {
        return;
      }

      const recipientIds = participants.map(p => p.userId);

      // Get active FCM tokens for recipients (excluding sender)
      const tokens = await prisma.pushToken.findMany({
        where: {
          userId: { in: recipientIds },
          isActive: true,
          deletedAt: null,
        },
        select: { token: true, userId: true },
      });

      if (tokens.length === 0) {
        console.log('[ChatNotification] No active FCM tokens found for recipients');
        return;
      }

      // Prepare notification content
      const title = input.senderName;
      const body = this.getMessagePreview(input.content, input.messageType);

      // Send to all recipient tokens
      const fcmTokens = tokens.map(t => t.token);

      const message = {
        notification: {
          title,
          body,
        },
        data: {
          type: 'chat_message',
          conversationId: input.conversationId,
          messageId: input.messageId,
          senderId: input.senderId,
        },
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // Log results
      console.log(`[ChatNotification] Sent ${response.successCount} notifications, ${response.failureCount} failed`);

      // Handle failed tokens (remove invalid ones)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`[ChatNotification] Failed to send to token ${idx}:`, resp.error?.message);
            // Mark token as inactive if it's invalid
            if (resp.error?.code === 'messaging/invalid-registration-token' ||
                resp.error?.code === 'messaging/registration-token-not-registered') {
              failedTokens.push(fcmTokens[idx]);
            }
          }
        });

        // Deactivate failed tokens
        if (failedTokens.length > 0) {
          await prisma.pushToken.updateMany({
            where: { token: { in: failedTokens } },
            data: { isActive: false, deletedAt: new Date() },
          });
          console.log(`[ChatNotification] Deactivated ${failedTokens.length} invalid tokens`);
        }
      }
    } catch (error) {
      // Fail silently - do not break chat functionality
      console.error('[ChatNotification] Error sending notification:', error);
    }
  }

  /**
   * Generate message preview for notification body
   */
  private getMessagePreview(content: string | null, messageType: string): string {
    if (messageType === 'IMAGE') {
      return '📷 Image';
    }
    if (messageType === 'AUDIO') {
      return '🎤 Audio';
    }

    // Media messages without caption
    if (!content) {
      return '📎 Attachment';
    }

    // Text message - truncate if too long
    const maxLength = 100;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }
}

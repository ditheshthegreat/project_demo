/**
 * @file createNotification.usecase.ts
 * @module Notifications/Application
 * @layer Application
 * @description Create Notification Use Case
 */

import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { fcmNotificationService } from '../../../../shared/infra/fcm/fcmNotification.service';

export interface CreateNotificationInput {
  userId: string;
  actorId: string;
  type: NotificationType;
  entityId: string;
  title: string;
  body: string;
  skipPush?: boolean; // If true, skip FCM push notification (audit-only)
}

export class CreateNotificationUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: CreateNotificationInput): Promise<Notification | null> {
    try {
      // Rule: Do NOT notify self (except for SYSTEM notifications)
      if (input.userId === input.actorId && input.type !== NotificationType.SYSTEM) {
        return null;
      }

      // Create notification entity
      const notification = Notification.create({
        id: uuidv4(),
        userId: input.userId,
        actorId: input.actorId,
        type: input.type,
        entityId: input.entityId,
        title: input.title,
        body: input.body,
        isRead: false,
      });

      // Persist notification
      const created = await this.notificationRepository.create(notification);

      // Send push notification asynchronously (fire-and-forget) unless skipPush is true
      if (!input.skipPush) {
        this.sendPushNotificationAsync(created);
      }

      return created;
    } catch (error) {
      // Fail silently - notifications should never break core functionality
      console.error('[CreateNotification] Failed to create notification:', error);
      return null;
    }
  }

  /**
   * Send push notification asynchronously (non-blocking)
   * Fire-and-forget pattern - does not block API response
   */
  private sendPushNotificationAsync(notification: Notification): void {
    // Fire-and-forget: start async operation but don't await
    fcmNotificationService.sendNotification({
      userId: notification.userId,
      title: notification.title,
      body: notification.body,
      data: {
        type: notification.type,
        entityId: notification.entityId,
      },
    }).catch(error => {
      // Log errors but don't propagate
      console.error('[CreateNotification] FCM send failed:', error);
    });
  }
}

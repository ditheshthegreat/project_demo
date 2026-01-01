/**
 * @file markAllNotificationsRead.usecase.ts
 * @module Notifications/Application
 * @layer Application
 * @description Mark All Notifications as Read Use Case
 */

import { INotificationRepository } from '../../domain/repositories/INotificationRepository';

export interface MarkAllNotificationsReadInput {
  userId: string;
}

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: MarkAllNotificationsReadInput): Promise<void> {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    // Mark all notifications as read for the user
    await this.notificationRepository.markAllAsRead(input.userId);
  }
}

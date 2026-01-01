/**
 * @file markNotificationRead.usecase.ts
 * @module Notifications/Application
 * @layer Application
 * @description Mark Notification as Read Use Case
 */

import { INotificationRepository } from '../../domain/repositories/INotificationRepository';

export interface MarkNotificationReadInput {
  notificationId: string;
  userId: string;
}

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: MarkNotificationReadInput): Promise<void> {
    if (!input.notificationId || input.notificationId.trim().length === 0) {
      throw new Error('Notification ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    // Mark notification as read (repository handles ownership validation)
    await this.notificationRepository.markAsRead(
      input.notificationId,
      input.userId
    );
  }
}

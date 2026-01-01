/**
 * @file getNotifications.usecase.ts
 * @module Notifications/Application
 * @layer Application
 * @description Get Notifications Use Case
 */

import { INotificationRepository, PaginatedNotifications } from '../../domain/repositories/INotificationRepository';

export interface GetNotificationsInput {
  userId: string;
  page?: number;
  limit?: number;
}

export class GetNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: GetNotificationsInput): Promise<PaginatedNotifications> {
    const page = input.page || 1;
    const limit = input.limit || 20;

    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const notifications = await this.notificationRepository.getByUser(
      input.userId,
      { page, limit }
    );

    return notifications;
  }
}

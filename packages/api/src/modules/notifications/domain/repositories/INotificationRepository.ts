/**
 * @file INotificationRepository.ts
 * @module Notifications/Domain
 * @layer Domain
 * @description Notification Repository Interface
 */

import { Notification } from '../entities/notification.entity';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface INotificationRepository {
  /**
   * Create a new notification
   */
  create(notification: Notification): Promise<Notification>;

  /**
   * Get notifications for a user with pagination
   */
  getByUser(userId: string, pagination: PaginationParams): Promise<PaginatedNotifications>;

  /**
   * Mark a specific notification as read
   */
  markAsRead(notificationId: string, userId: string): Promise<void>;

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): Promise<void>;
}

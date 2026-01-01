/**
 * @file notification.repository.impl.ts
 * @module Notifications/Infrastructure
 * @layer Infrastructure
 * @description Notification Repository Implementation (Prisma Adapter)
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { Notification, NotificationType } from '../../domain/entities/notification.entity';
import { INotificationRepository, PaginationParams, PaginatedNotifications } from '../../domain/repositories/INotificationRepository';

export class NotificationRepositoryImpl implements INotificationRepository {
  async create(notification: Notification): Promise<Notification> {
    const created = await prisma.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        actorId: notification.actorId,
        type: notification.type,
        entityId: notification.entityId,
        title: notification.title,
        body: notification.body,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
    });

    return this.mapToDomain(created);
  }

  async getByUser(userId: string, pagination: PaginationParams): Promise<PaginatedNotifications> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    return {
      notifications: notifications.map(this.mapToDomain),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user owns this notification
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  private mapToDomain(prismaNotification: any): Notification {
    return Notification.create({
      id: prismaNotification.id,
      userId: prismaNotification.userId,
      actorId: prismaNotification.actorId,
      type: prismaNotification.type as NotificationType,
      entityId: prismaNotification.entityId,
      title: prismaNotification.title,
      body: prismaNotification.body,
      isRead: prismaNotification.isRead,
      createdAt: prismaNotification.createdAt,
    });
  }
}

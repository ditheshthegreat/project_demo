/**
 * @file notification.controller.ts
 * @module Notifications/Interfaces/Controllers
 * @layer Interface
 * @description Notification Controller - HTTP handlers for notification operations
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';
import { GetNotificationsUseCase } from '../../application/usecases/getNotifications.usecase';
import { MarkNotificationReadUseCase } from '../../application/usecases/markNotificationRead.usecase';
import { MarkAllNotificationsReadUseCase } from '../../application/usecases/markAllNotificationsRead.usecase';
import { GetNotificationsDtoSchema, ReadNotificationDtoSchema } from '../dto/notification.dto';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase
  ) {}

  /**
   * GET /notifications
   * Get user notifications with pagination
   */
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get database user ID
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Validate query params
      const validated = GetNotificationsDtoSchema.parse(req.query);

      // Get notifications
      const result = await this.getNotificationsUseCase.execute({
        userId: user.id,
        page: validated.page,
        limit: validated.limit,
      });

      res.status(200).json({
        success: true,
        data: {
          notifications: result.notifications.map(n => n.toJSON()),
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /notifications/:id/read
   * Mark notification as read
   */
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get database user ID
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Validate notification ID
      const validated = ReadNotificationDtoSchema.parse({ id: req.params.id });

      // Mark as read
      await this.markNotificationReadUseCase.execute({
        notificationId: validated.id,
        userId: user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get database user ID
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Mark all as read
      await this.markAllNotificationsReadUseCase.execute({
        userId: user.id,
      });

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      next(error);
    }
  }
}

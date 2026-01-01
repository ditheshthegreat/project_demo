/**
 * @file notifications.module.ts
 * @description Notifications module exports
 */

import { Router } from 'express';
import { PushTokenRoutes } from './interfaces/routes/pushToken.routes';
import { NotificationRoutes } from './interfaces/routes/notification.routes';
import { NotificationController } from './interfaces/controllers/notification.controller';
import { NotificationRepositoryImpl } from './infrastructure/database/notification.repository.impl';
import { GetNotificationsUseCase } from './application/usecases/getNotifications.usecase';
import { MarkNotificationReadUseCase } from './application/usecases/markNotificationRead.usecase';
import { MarkAllNotificationsReadUseCase } from './application/usecases/markAllNotificationsRead.usecase';

// Infrastructure layer
const notificationRepository = new NotificationRepositoryImpl();

// Application layer
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);
const markAllNotificationsReadUseCase = new MarkAllNotificationsReadUseCase(notificationRepository);

// Interface layer
const notificationController = new NotificationController(
  getNotificationsUseCase,
  markNotificationReadUseCase,
  markAllNotificationsReadUseCase
);

const notificationRoutes = new NotificationRoutes(notificationController);
const pushTokenRoutes = new PushTokenRoutes();

// Mount routes
const router = Router();
router.use('/token', pushTokenRoutes.router);
router.use('/', notificationRoutes.getRouter());

export const notificationsRouter = router;

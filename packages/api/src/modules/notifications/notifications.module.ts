/**
 * @file notifications.module.ts
 * @description Notifications module exports
 */

import { PushTokenRoutes } from './interfaces/routes/pushToken.routes';

const pushTokenRoutes = new PushTokenRoutes();

export const notificationsRouter = pushTokenRoutes.router;

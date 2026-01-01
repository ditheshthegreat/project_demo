/**
 * @file notification.routes.ts
 * @module Notifications/Interfaces/Routes
 * @layer Interface
 * @description Notification Routes with Swagger Documentation
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class NotificationRoutes {
  public router: Router;
  private controller: NotificationController;

  constructor(notificationController: NotificationController) {
    this.router = Router();
    this.controller = notificationController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/notifications:
     *   get:
     *     summary: Get user notifications
     *     description: |
     *       Retrieve all notifications for the authenticated user with pagination.
     *       Returns a Facebook-style unified notification list sorted by recency.
     *       
     *       **Features:**
     *       - Paginated results
     *       - Sorted by createdAt (newest first)
     *       - Includes read/unread status
     *       - Contains actor and entity information
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - Only returns user's own notifications
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *           minimum: 1
     *         description: Page number
     *         example: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 20
     *           minimum: 1
     *           maximum: 100
     *         description: Items per page
     *         example: 20
     *     responses:
     *       200:
     *         description: Notifications retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     notifications:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             format: uuid
     *                           userId:
     *                             type: string
     *                             format: uuid
     *                           actorId:
     *                             type: string
     *                             format: uuid
     *                           type:
     *                             type: string
     *                             enum: [LIKE, COMMENT, FRIEND_REQUEST, MESSAGE, FEED_REPORT, SYSTEM]
     *                           entityId:
     *                             type: string
     *                           title:
     *                             type: string
     *                           body:
     *                             type: string
     *                           isRead:
     *                             type: boolean
     *                           createdAt:
     *                             type: string
     *                             format: date-time
     *                     pagination:
     *                       type: object
     *                       properties:
     *                         total:
     *                           type: integer
     *                         page:
     *                           type: integer
     *                         limit:
     *                           type: integer
     *                         totalPages:
     *                           type: integer
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    this.router.get(
      '/',
      verifyAuth,
      (req, res, next) => this.controller.getNotifications(req, res, next)
    );

    /**
     * @swagger
     * /api/notifications/{id}/read:
     *   post:
     *     summary: Mark notification as read
     *     description: |
     *       Mark a specific notification as read for the authenticated user.
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - User can only mark their own notifications as read
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Notification ID
     *         example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *     responses:
     *       200:
     *         description: Notification marked as read
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Notification marked as read"
     *       400:
     *         description: Invalid notification ID
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User or notification not found
     */
    this.router.post(
      '/:id/read',
      verifyAuth,
      (req, res, next) => this.controller.markAsRead(req, res, next)
    );

    /**
     * @swagger
     * /api/notifications/read-all:
     *   post:
     *     summary: Mark all notifications as read
     *     description: |
     *       Mark all unread notifications as read for the authenticated user.
     *       Useful for "Mark all as read" button functionality.
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - Only affects user's own notifications
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: All notifications marked as read
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "All notifications marked as read"
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    this.router.post(
      '/read-all',
      verifyAuth,
      (req, res, next) => this.controller.markAllAsRead(req, res, next)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

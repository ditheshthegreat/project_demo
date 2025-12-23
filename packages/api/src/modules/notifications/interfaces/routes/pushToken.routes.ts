/**
 * @file pushToken.routes.ts
 * @description Routes for push notification token management
 */

import { Router } from 'express';
import { PushTokenController } from '../controllers/pushToken.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class PushTokenRoutes {
  public router: Router;
  private controller: PushTokenController;

  constructor() {
    this.router = Router();
    this.controller = new PushTokenController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/notifications/token:
     *   post:
     *     summary: Register FCM push notification token
     *     description: Register or update a Firebase Cloud Messaging token for push notifications. If the token already exists, it will be reactivated.
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *               - deviceType
     *             properties:
     *               token:
     *                 type: string
     *                 description: FCM token from device
     *                 example: "fKj8zXqT3E:APA91bF..."
     *               deviceType:
     *                 type: string
     *                 enum: [ANDROID, IOS, WEB]
     *                 description: Device platform type
     *                 example: "ANDROID"
     *               deviceId:
     *                 type: string
     *                 description: Optional device identifier
     *                 example: "device-12345"
     *     responses:
     *       200:
     *         description: Token registered successfully
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
     *                   example: "Push token registered successfully"
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Validation error"
     */
    this.router.post(
      '/token',
      verifyAuth,
      this.controller.registerToken.bind(this.controller)
    );

    /**
     * @swagger
     * /api/notifications/token:
     *   delete:
     *     summary: Remove/deactivate FCM push notification token
     *     description: Deactivate a registered FCM token. User can only remove their own tokens.
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *             properties:
     *               token:
     *                 type: string
     *                 description: FCM token to remove
     *                 example: "fKj8zXqT3E:APA91bF..."
     *     responses:
     *       200:
     *         description: Token removed successfully
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
     *                   example: "Push token removed successfully"
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       404:
     *         description: Token not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Token not found"
     */
    this.router.delete(
      '/token',
      verifyAuth,
      this.controller.removeToken.bind(this.controller)
    );
  }
}

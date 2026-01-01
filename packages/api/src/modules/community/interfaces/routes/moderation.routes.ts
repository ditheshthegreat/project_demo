/**
 * @file moderation.routes.ts
 * @module Community/Interfaces/Routes
 * @layer Interface
 * @description Moderation Routes - User blocking and reporting endpoints
 */

import { Router } from 'express';
import { ModerationController } from '../controllers/moderation.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class ModerationRoutes {
  public router: Router;
  private controller: ModerationController;

  constructor(moderationController: ModerationController) {
    this.router = Router();
    this.controller = moderationController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/community/block/{userId}:
     *   post:
     *     summary: Block a user
     *     description: |
     *       Block another user from interacting with you.
     *       
     *       **Effects:**
     *       - Blocked user will not appear in Explore
     *       - Blocked user will not appear in Feed
     *       - Blocked user cannot send you chat messages
     *       - Existing conversations become read-only
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - Cannot block yourself
     *       - Cannot block the same user twice
     *       - Soft-deleted users cannot block
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of user to block
     *         example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *     responses:
     *       201:
     *         description: User blocked successfully
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
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     blockerId:
     *                       type: string
     *                       format: uuid
     *                     blockedId:
     *                       type: string
     *                       format: uuid
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                 message:
     *                   type: string
     *                   example: "User blocked successfully"
     *       400:
     *         description: Cannot block yourself or user already blocked
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    this.router.post('/block/:userId', verifyAuth, this.controller.blockUser.bind(this.controller));

    /**
     * @swagger
     * /api/community/block/{userId}:
     *   delete:
     *     summary: Unblock a user
     *     description: |
     *       Unblock a previously blocked user.
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - User must be currently blocked
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of user to unblock
     *         example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *     responses:
     *       200:
     *         description: User unblocked successfully
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
     *                   example: "User unblocked successfully"
     *       400:
     *         description: User is not blocked
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    this.router.delete('/block/:userId', verifyAuth, this.controller.unblockUser.bind(this.controller));

    /**
     * @swagger
     * /api/community/blocked:
     *   get:
     *     summary: Get list of blocked users
     *     description: |
     *       Retrieve all users that the authenticated user has blocked.
     *       Includes basic user information (name, profile image).
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - Only returns user's own blocked list
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Blocked users retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       blockerId:
     *                         type: string
     *                         format: uuid
     *                       blockedId:
     *                         type: string
     *                         format: uuid
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                       user:
     *                         type: object
     *                         nullable: true
     *                         properties:
     *                           id:
     *                             type: string
     *                           name:
     *                             type: string
     *                           profileImage:
     *                             type: string
     *                             nullable: true
     *                 message:
     *                   type: string
     *                   example: "Blocked users retrieved successfully"
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    this.router.get('/blocked', verifyAuth, this.controller.getBlockedUsers.bind(this.controller));

    /**
     * @swagger
     * /api/community/report/{userId}:
     *   post:
     *     summary: Report a user
     *     description: |
     *       Report a user for inappropriate behavior.
     *       Reports are stored for admin review.
     *       
     *       **Rules:**
     *       - Cannot report yourself
     *       - Cannot report the same user twice
     *       - Report is marked as PENDING by default
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - Soft-deleted users cannot report
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of user to report
     *         example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - reason
     *             properties:
     *               reason:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 200
     *                 description: Short reason for report
     *                 example: "Harassment"
     *               description:
     *                 type: string
     *                 maxLength: 1000
     *                 description: Optional detailed description
     *                 example: "This user has been sending inappropriate messages repeatedly."
     *     responses:
     *       201:
     *         description: User reported successfully
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
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     reporterId:
     *                       type: string
     *                       format: uuid
     *                     reportedUserId:
     *                       type: string
     *                       format: uuid
     *                     reason:
     *                       type: string
     *                     description:
     *                       type: string
     *                       nullable: true
     *                     status:
     *                       type: string
     *                       enum: [PENDING, REVIEWED, RESOLVED]
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                 message:
     *                   type: string
     *                   example: "User reported successfully"
     *       400:
     *         description: Cannot report yourself or already reported
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    this.router.post('/report/:userId', verifyAuth, this.controller.reportUser.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}

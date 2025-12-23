/**
 * @file friend.routes.ts
 * @module Community/Interfaces/Routes
 * @layer Interface
 * @description Friend Routes with Swagger Documentation
 */

import { Router } from 'express';
import { FriendController } from '../controllers/friend.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class FriendRoutes {
  private router: Router;

  constructor(private readonly friendController: FriendController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/community/friend/request:
     *   post:
     *     summary: Send friend request
     *     description: Send a friend request to another user
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - recipientId
     *             properties:
     *               recipientId:
     *                 type: string
     *                 format: uuid
     *                 description: User ID to send request to
     *           examples:
     *             example1:
     *               summary: Send friend request
     *               value:
     *                 recipientId: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       201:
     *         description: Friend request sent successfully
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
     *                   example: "Friend request sent successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     userId:
     *                       type: string
     *                       format: uuid
     *                     friendId:
     *                       type: string
     *                       format: uuid
     *                     status:
     *                       type: string
     *                       enum: [pending, accepted, rejected]
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Validation error or cannot send request to yourself
     *       401:
     *         description: Unauthorized
     *       409:
     *         description: Duplicate request or already friends
     */
    this.router.post(
      '/request',
      verifyAuth,
      (req, res, next) => this.friendController.sendRequest(req, res, next)
    );

    /**
     * @swagger
     * /api/community/friend/request/{requestId}:
     *   delete:
     *     summary: Cancel friend request
     *     description: Cancel a pending friend request that you sent
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: requestId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Friend request ID to cancel
     *         example: "76e27084-d144-4886-9834-2693b43923dd"
     *     responses:
     *       200:
     *         description: Friend request cancelled successfully
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
     *                   example: "Friend request cancelled successfully"
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Cannot cancel - not your request or invalid status
     *       404:
     *         description: Friend request not found
     */
    this.router.delete(
      '/request/:requestId',
      verifyAuth,
      (req, res, next) => this.friendController.cancelFriendRequest(req, res, next)
    );

    /**
     * @swagger
     * /api/community/friend/requests:
     *   get:
     *     summary: Get pending friend requests
     *     description: Retrieve all pending friend requests received
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Pending requests retrieved successfully
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
     *                   example: "Pending requests retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       userId:
     *                         type: string
     *                         format: uuid
     *                       friendId:
     *                         type: string
     *                         format: uuid
     *                       status:
     *                         type: string
     *                         enum: [pending]
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/requests',
      verifyAuth,
      (req, res, next) => this.friendController.getPendingRequests(req, res, next)
    );

    /**
     * @swagger
     * /api/community/friend/accept:
     *   post:
     *     summary: Accept friend request
     *     description: Accept a pending friend request
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - requestId
     *             properties:
     *               requestId:
     *                 type: string
     *                 format: uuid
     *                 description: Friend request ID
     *           examples:
     *             example1:
     *               summary: Accept request
     *               value:
     *                 requestId: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       200:
     *         description: Friend request accepted
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
     *                   example: "Friend request accepted"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     userId:
     *                       type: string
     *                       format: uuid
     *                     friendId:
     *                       type: string
     *                       format: uuid
     *                     status:
     *                       type: string
     *                       enum: [accepted]
     *                     acceptedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Not authorized to accept this request
     *       404:
     *         description: Request not found
     */
    this.router.post(
      '/accept',
      verifyAuth,
      (req, res, next) => this.friendController.acceptRequest(req, res, next)
    );

    /**
     * @swagger
     * /api/community/friend/reject:
     *   post:
     *     summary: Reject friend request
     *     description: Reject a pending friend request
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - requestId
     *             properties:
     *               requestId:
     *                 type: string
     *                 format: uuid
     *                 description: Friend request ID
     *           examples:
     *             example1:
     *               summary: Reject request
     *               value:
     *                 requestId: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       200:
     *         description: Friend request rejected
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
     *                   example: "Friend request rejected"
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Not authorized to reject this request
     *       404:
     *         description: Request not found
     */
    this.router.post(
      '/reject',
      verifyAuth,
      (req, res, next) => this.friendController.rejectRequest(req, res, next)
    );

    /**
     * @swagger
     * /api/community/friends:
     *   get:
     *     summary: Get friends list
     *     description: Retrieve all accepted friendships
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Friends retrieved successfully
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
     *                   example: "Friends retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       userId:
     *                         type: string
     *                         format: uuid
     *                       friendId:
     *                         type: string
     *                         format: uuid
     *                       status:
     *                         type: string
     *                         enum: [accepted]
     *                       acceptedAt:
     *                         type: string
     *                         format: date-time
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/',
      verifyAuth,
      (req, res, next) => this.friendController.getFriends(req, res, next)
    );

    /**
     * @swagger
     * /api/community/friend/remove/{userId}:
     *   delete:
     *     summary: Remove friend
     *     description: Remove a friend (soft delete)
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
     *         description: Friend's user ID
     *     responses:
     *       200:
     *         description: Friend removed successfully
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
     *                   example: "Friend removed successfully"
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Friendship not found
     */
    this.router.delete(
      '/remove/:userId',
      verifyAuth,
      (req, res, next) => this.friendController.removeFriend(req, res, next)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

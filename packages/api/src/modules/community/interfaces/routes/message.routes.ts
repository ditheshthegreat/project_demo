/**
 * @file message.routes.ts
 * @module Community/Interfaces/Routes
 * @layer Interface
 * @description Message Routes with Swagger Documentation
 */

import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class MessageRoutes {
  private router: Router;

  constructor(private readonly messageController: MessageController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/community/message/start:
     *   post:
     *     summary: Start conversation
     *     description: Create or retrieve existing conversation with another user
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
     *                 description: User ID to start conversation with
     *                 example: "firebase-user-id"
     *           examples:
     *             example1:
     *               summary: Start conversation
     *               value:
     *                 recipientId: "firebase-user-id-here"
     *     responses:
     *       200:
     *         description: Conversation created or retrieved successfully
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
     *                   example: "Conversation created"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                       description: Conversation ID
     *                     participant1Id:
     *                       type: string
     *                       description: First participant Firebase UID
     *                     participant2Id:
     *                       type: string
     *                       description: Second participant Firebase UID
     *                     lastMessageAt:
     *                       type: string
     *                       format: date-time
     *                       nullable: true
     *                       description: Timestamp of last message
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Validation error or cannot message yourself
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      '/start',
      verifyAuth,
      (req, res) => this.messageController.startConversation(req, res)
    );

    /**
     * @swagger
     * /api/community/messages:
     *   get:
     *     summary: Get conversations
     *     description: Retrieve all conversations for the current user
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Conversations retrieved successfully
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
     *                   example: "Conversations retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       participant1Id:
     *                         type: string
     *                       participant2Id:
     *                         type: string
     *                       lastMessageAt:
     *                         type: string
     *                         format: date-time
     *                         nullable: true
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                       updatedAt:
     *                         type: string
     *                         format: date-time
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/',
      verifyAuth,
      (req, res) => this.messageController.getConversations(req, res)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

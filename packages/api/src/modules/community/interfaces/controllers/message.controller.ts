/**
 * @file message.controller.ts
 * @module Community/Interfaces/Controllers
 * @layer Interface
 * @description Message Controller - HTTP handlers for conversation management
 */

import { Request, Response } from 'express';
import { StartConversationUseCase } from '../../application/usecases/startConversation.usecase';
import { GetConversationsUseCase } from '../../application/usecases/getConversations.usecase';
import { StartConversationDtoSchema } from '../dto/startConversation.dto';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';

export class MessageController {
  constructor(
    private readonly startConversationUseCase: StartConversationUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase
  ) {}

  /**
   * Start or get existing conversation
   * POST /community/message/start
   */
  async startConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const validated = StartConversationDtoSchema.parse(req.body);

      const conversation = await this.startConversationUseCase.execute(userId, validated.recipientId);

      res.status(200).json({
        success: true,
        message: 'Conversation created',
        data: conversation.toJSON(),
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
      throw error;
    }
  }

  /**
   * Get user's conversations
   * GET /community/messages
   */
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const conversations = await this.getConversationsUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: 'Conversations retrieved successfully',
        data: conversations.map(conv => conv.toJSON()),
      });
    } catch (error) {
      throw error;
    }
  }
}

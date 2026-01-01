/**
 * @file chat.controller.ts
 * @module Chat/Interfaces/Controllers
 * @layer Interface
 * @description Chat Controller - HTTP handlers for chat messages
 */

import { Response } from 'express';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';
import { SendMessageUseCase } from '../../application/usecases/sendMessage.usecase';
import { GetMessagesUseCase } from '../../application/usecases/getMessages.usecase';
import { GetConversationsUseCase } from '../../application/usecases/getConversations.usecase';
import { AddReactionUseCase } from '../../application/usecases/addReaction.usecase';
import { RemoveReactionUseCase } from '../../application/usecases/removeReaction.usecase';
import { UploadMediaMessageUseCase } from '../../application/usecases/uploadMediaMessage.usecase';
import { SearchMessagesUseCase } from '../../application/usecases/searchMessages.usecase';
import { SendMessageDtoSchema, GetMessagesDtoSchema } from '../dto/message.dto';
import { AddReactionDtoSchema } from '../dto/reaction.dto';
import { SearchMessagesDtoSchema } from '../dto/search.dto';
import { MessageType } from '../../domain/entities/message.entity';
import { s3Service } from '../../../../shared/infra/storage/s3.service';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class ChatController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly addReactionUseCase: AddReactionUseCase,
    private readonly removeReactionUseCase: RemoveReactionUseCase,
    private readonly uploadMediaMessageUseCase: UploadMediaMessageUseCase,
    private readonly searchMessagesUseCase: SearchMessagesUseCase
  ) {}

  /**
   * GET /chat/conversations
   * Get all conversations for authenticated user
   */
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
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

      const conversations = await this.getConversationsUseCase.execute(user.id);

      res.status(200).json({
        success: true,
        data: conversations,
        message: 'Conversations retrieved successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /chat/conversations/:id/messages
   * Get messages for a conversation with pagination
   */
  async getMessages(req: AuthRequest, res: Response): Promise<void> {
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

      const { id: conversationId } = req.params;
      const validated = GetMessagesDtoSchema.parse(req.query);

      const result = await this.getMessagesUseCase.execute({
        conversationId,
        userId: user.id,
        limit: validated.limit,
        offset: validated.offset,
      });

      res.status(200).json({
        success: true,
        data: {
          messages: result.messages.map(m => m.toJSON()),
          total: result.total,
          limit: validated.limit,
          offset: validated.offset,
        },
        message: 'Messages retrieved successfully',
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
   * POST /chat/messages
   * Send a message (REST fallback if WebSocket unavailable)
   */
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
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

      const validated = SendMessageDtoSchema.parse(req.body);

      const message = await this.sendMessageUseCase.execute({
        conversationId: validated.conversationId,
        senderId: user.id,
        content: validated.content,
        type: validated.type as any,
      });

      res.status(201).json({
        success: true,
        data: message.toJSON(),
        message: 'Message sent successfully',
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
   * POST /chat/message/:id/react
   * Add reaction to a message
   */
  async addReaction(req: AuthRequest, res: Response): Promise<void> {
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

      const { id: messageId } = req.params;
      const validated = AddReactionDtoSchema.parse(req.body);

      const reaction = await this.addReactionUseCase.execute({
        messageId,
        userId: user.id,
        emoji: validated.emoji,
      });

      res.status(200).json({
        success: true,
        data: reaction,
        message: 'Reaction added successfully',
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
   * DELETE /chat/message/:id/react
   * Remove reaction from a message
   */
  async removeReaction(req: AuthRequest, res: Response): Promise<void> {
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

      const { id: messageId } = req.params;

      await this.removeReactionUseCase.execute({
        messageId,
        userId: user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Reaction removed successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /chat/message/media
   * Upload media message (image or audio)
   */
  async uploadMediaMessage(req: AuthRequest, res: Response): Promise<void> {
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

      // Validate file is present
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      // Get required fields from body
      const { conversationId, type, caption } = req.body;

      if (!conversationId) {
        res.status(400).json({
          success: false,
          message: 'Conversation ID is required',
        });
        return;
      }

      if (!type || !['IMAGE', 'AUDIO'].includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Type must be IMAGE or AUDIO',
        });
        return;
      }

      const messageType = type as 'IMAGE' | 'AUDIO';

      // Upload media and create message
      const message = await this.uploadMediaMessageUseCase.execute({
        conversationId,
        senderId: user.id,
        file: {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        type: MessageType[messageType],
        caption: caption,
      });

      // Generate signed URL for media
      const messageJson = message.toJSON();
      if (messageJson.mediaUrl) {
        messageJson.mediaUrl = await s3Service.getSignedUrl(messageJson.mediaUrl);
      }

      res.status(201).json({
        success: true,
        data: messageJson,
        message: 'Media message uploaded successfully',
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * GET /chat/search
   * Search messages in user's conversations
   */
  async searchMessages(req: AuthRequest, res: Response): Promise<void> {
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

      const validated = SearchMessagesDtoSchema.parse(req.query);

      const result = await this.searchMessagesUseCase.execute({
        query: validated.q,
        userId: user.id,
        conversationId: validated.conversationId,
        limit: validated.limit,
        offset: validated.offset,
      });

      // Generate signed URLs for media messages
      const messagesWithSignedUrls = await Promise.all(
        result.messages.map(async (msg) => {
          const messageJson = msg.toJSON();
          if (messageJson.mediaUrl) {
            try {
              messageJson.mediaUrl = await s3Service.getSignedUrl(messageJson.mediaUrl);
            } catch (error) {
              messageJson.mediaUrl = null;
            }
          }
          return messageJson;
        })
      );

      res.status(200).json({
        success: true,
        data: {
          messages: messagesWithSignedUrls,
          total: result.total,
          limit: validated.limit,
          offset: validated.offset,
        },
        message: 'Messages found',
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
}

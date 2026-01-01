/**
 * @file chatHandlers.ts
 * @module Chat/Infrastructure/WebSocket
 * @layer Infrastructure
 * @description Socket.IO Chat Event Handlers
 */

import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from './socketAuth.middleware';
import { SendMessageUseCase } from '../../application/usecases/sendMessage.usecase';
import { MarkMessageAsReadUseCase } from '../../application/usecases/markMessageAsRead.usecase';
import { AddReactionUseCase } from '../../application/usecases/addReaction.usecase';
import { RemoveReactionUseCase } from '../../application/usecases/removeReaction.usecase';
import { MessageType } from '../../domain/entities/message.entity';

export class ChatHandlers {
  constructor(
    private readonly io: SocketIOServer,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly markMessageAsReadUseCase: MarkMessageAsReadUseCase,
    private readonly addReactionUseCase: AddReactionUseCase,
    private readonly removeReactionUseCase: RemoveReactionUseCase
  ) {}

  /**
   * Register all chat event handlers for a socket
   */
  registerHandlers(socket: AuthenticatedSocket): void {
    // Join conversation room
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        const roomName = `conversation_${conversationId}`;
        await socket.join(roomName);
        
        socket.emit('joined_conversation', {
          conversationId,
          message: 'Successfully joined conversation',
        });
      } catch (error) {
        socket.emit('error', {
          event: 'join_conversation',
          message: 'Failed to join conversation',
        });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      try {
        const roomName = `conversation_${conversationId}`;
        socket.leave(roomName);
        
        socket.emit('left_conversation', {
          conversationId,
          message: 'Left conversation',
        });
      } catch (error) {
        socket.emit('error', {
          event: 'leave_conversation',
          message: 'Failed to leave conversation',
        });
      }
    });

    // Send message via WebSocket (new event name: message:send)
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
      type?: string;
    }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', {
            event: 'message:send',
            message: 'User not authenticated',
          });
          return;
        }

        // Validate message type
        const messageType = data.type as MessageType || MessageType.TEXT;

        // 1. Save to database first (persist before emit)
        const message = await this.sendMessageUseCase.execute({
          conversationId: data.conversationId,
          senderId: socket.userId,
          content: data.content,
          type: messageType,
        });

        // 2. Emit to conversation room (message:receive)
        const roomName = `conversation_${data.conversationId}`;
        this.io.to(roomName).emit('message:receive', message.toJSON());

        // 3. lastMessageAt already updated in use case
      } catch (error: any) {
        socket.emit('error', {
          event: 'message:send',
          message: error.message || 'Failed to send message',
        });
      }
    });

    // Typing indicator start
    socket.on('typing:start', (data: { conversationId: string }) => {
      try {
        const roomName = `conversation_${data.conversationId}`;
        
        // Broadcast typing start to other users in the room (no DB write)
        socket.to(roomName).emit('typing:start', {
          conversationId: data.conversationId,
          userId: socket.userId,
        });
      } catch (error) {
        // Silently fail for typing indicators
      }
    });

    // Typing indicator stop
    socket.on('typing:stop', (data: { conversationId: string }) => {
      try {
        const roomName = `conversation_${data.conversationId}`;
        
        // Broadcast typing stop to other users in the room (no DB write)
        socket.to(roomName).emit('typing:stop', {
          conversationId: data.conversationId,
          userId: socket.userId,
        });
      } catch (error) {
        // Silently fail for typing indicators
      }
    });

    // Mark message as read (new event: message:read)
    socket.on('message:read', async (data: { messageId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', {
            event: 'message:read',
            message: 'User not authenticated',
          });
          return;
        }

        // Mark message as read in database
        const message = await this.markMessageAsReadUseCase.execute({
          messageId: data.messageId,
          userId: socket.userId,
        });

        // Broadcast read receipt to conversation room
        const roomName = `conversation_${message.conversationId}`;
        this.io.to(roomName).emit('message:read', {
          messageId: message.id,
          conversationId: message.conversationId,
          readAt: message.readAt,
          readBy: socket.userId,
        });
      } catch (error: any) {
        socket.emit('error', {
          event: 'message:read',
          message: error.message || 'Failed to mark message as read',
        });
      }
    });

    // Add reaction to message
    socket.on('reaction:add', async (data: { messageId: string; emoji: string }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', {
            event: 'reaction:add',
            message: 'User not authenticated',
          });
          return;
        }

        // Add reaction via use case
        const reaction = await this.addReactionUseCase.execute({
          messageId: data.messageId,
          userId: socket.userId,
          emoji: data.emoji,
        });

        // Broadcast reaction to conversation room
        const roomName = `conversation_${reaction.conversationId}`;
        this.io.to(roomName).emit('reaction:added', {
          messageId: data.messageId,
          reaction: {
            id: reaction.id,
            userId: reaction.userId,
            emoji: reaction.emoji,
            createdAt: reaction.createdAt,
            user: reaction.user,
          },
        });
      } catch (error: any) {
        socket.emit('error', {
          event: 'reaction:add',
          message: error.message || 'Failed to add reaction',
        });
      }
    });

    // Remove reaction from message
    socket.on('reaction:remove', async (data: { messageId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', {
            event: 'reaction:remove',
            message: 'User not authenticated',
          });
          return;
        }

        // Remove reaction via use case
        const result = await this.removeReactionUseCase.execute({
          messageId: data.messageId,
          userId: socket.userId,
        });

        // Broadcast reaction removal to conversation room
        const roomName = `conversation_${result.conversationId}`;
        this.io.to(roomName).emit('reaction:removed', {
          messageId: data.messageId,
          userId: socket.userId,
        });
      } catch (error: any) {
        socket.emit('error', {
          event: 'reaction:remove',
          message: error.message || 'Failed to remove reaction',
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}, User: ${socket.userId}`);
    });
  }
}


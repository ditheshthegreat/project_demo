/**
 * @file socketServer.ts
 * @module Chat/Infrastructure/WebSocket
 * @layer Infrastructure
 * @description Socket.IO Server Wrapper
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './socketAuth.middleware';
import { ChatHandlers } from './chatHandlers';
import { SendMessageUseCase } from '../../application/usecases/sendMessage.usecase';
import { MarkMessageAsReadUseCase } from '../../application/usecases/markMessageAsRead.usecase';
import { AddReactionUseCase } from '../../application/usecases/addReaction.usecase';
import { RemoveReactionUseCase } from '../../application/usecases/removeReaction.usecase';

export class SocketServer {
  private io: SocketIOServer;
  private chatHandlers: ChatHandlers;

  constructor(
    httpServer: HTTPServer,
    sendMessageUseCase: SendMessageUseCase,
    markMessageAsReadUseCase: MarkMessageAsReadUseCase,
    addReactionUseCase: AddReactionUseCase,
    removeReactionUseCase: RemoveReactionUseCase
  ) {
    // Initialize Socket.IO server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Configure based on environment
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Initialize chat handlers
    this.chatHandlers = new ChatHandlers(
      this.io,
      sendMessageUseCase,
      markMessageAsReadUseCase,
      addReactionUseCase,
      removeReactionUseCase
    );

    // Apply authentication middleware
    this.io.use(socketAuthMiddleware);

    // Handle connections
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`Socket connected: ${socket.id}, User: ${socket.userId}`);

      // Register chat event handlers
      this.chatHandlers.registerHandlers(socket);
    });

    console.log('✅ Socket.IO server initialized');
  }

  /**
   * Get Socket.IO server instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Emit event to a specific conversation room
   */
  emitToConversation(conversationId: string, event: string, data: any): void {
    const roomName = `conversation_${conversationId}`;
    this.io.to(roomName).emit(event, data);
  }

  /**
   * Emit event to a specific user
   */
  emitToUser(userId: string, event: string, data: any): void {
    this.io.to(userId).emit(event, data);
  }
}

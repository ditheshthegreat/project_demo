/**
 * @file chat.module.ts
 * @module Chat
 * @layer Module
 * @description Chat Module - Dependency Injection Container
 * 
 * Assembles all components of the Chat module using dependency injection.
 * Follows Clean Architecture by wiring together layers without coupling them.
 * 
 * **Architecture Layers:**
 * 1. Infrastructure: Message and Conversation repository implementations
 * 2. Application: Use cases for chat operations
 * 3. Interface: ChatController and ChatRoutes for HTTP
 * 4. WebSocket: Socket.IO server for real-time messaging
 * 
 * @example
 * import { chatRouter, initializeChatWebSocket } from './modules/chat/chat.module';
 * app.use('/api/chat', chatRouter);
 * initializeChatWebSocket(httpServer);
 */

import { Router } from 'express';
import { Server as HTTPServer } from 'http';
import { MessageRepositoryImpl } from './infrastructure/database/messageRepository.impl';
import { ConversationRepositoryImpl } from './infrastructure/database/conversationRepository.impl';
import { SendMessageUseCase } from './application/usecases/sendMessage.usecase';
import { GetMessagesUseCase } from './application/usecases/getMessages.usecase';
import { GetConversationsUseCase } from './application/usecases/getConversations.usecase';
import { MarkMessageAsReadUseCase } from './application/usecases/markMessageAsRead.usecase';
import { AddReactionUseCase } from './application/usecases/addReaction.usecase';
import { RemoveReactionUseCase } from './application/usecases/removeReaction.usecase';
import { UploadMediaMessageUseCase } from './application/usecases/uploadMediaMessage.usecase';
import { SearchMessagesUseCase } from './application/usecases/searchMessages.usecase';
import { CreateGroupUseCase } from './application/usecases/createGroup.usecase';
import { AddGroupMemberUseCase } from './application/usecases/addGroupMember.usecase';
import { RemoveGroupMemberUseCase } from './application/usecases/removeGroupMember.usecase';
import { LeaveGroupUseCase } from './application/usecases/leaveGroup.usecase';
import { ChatController } from './interfaces/controllers/chat.controller';
import { GroupController } from './interfaces/controllers/group.controller';
import { ChatRoutes } from './interfaces/routes/chat.routes';
import { GroupRoutes } from './interfaces/routes/group.routes';
import { SocketServer } from './infrastructure/websocket/socketServer';
import { NotificationRepositoryImpl } from '../notifications/infrastructure/database/notification.repository.impl';
import { CreateNotificationUseCase } from '../notifications/application/usecases/createNotification.usecase';

/**
 * Chat Module
 * 
 * Dependency injection container for chat functionality.
 * REST API for message history, conversations, and group management.
 * WebSocket server for real-time messaging.
 */
export class ChatModule {
  private router: Router;
  private messageRepository: MessageRepositoryImpl;
  private conversationRepository: ConversationRepositoryImpl;
  private sendMessageUseCase: SendMessageUseCase;
  private markMessageAsReadUseCase: MarkMessageAsReadUseCase;
  private addReactionUseCase: AddReactionUseCase;
  private removeReactionUseCase: RemoveReactionUseCase;
  private socketServer?: SocketServer;

  constructor() {
    // Infrastructure layer: Repositories
    this.messageRepository = new MessageRepositoryImpl();
    this.conversationRepository = new ConversationRepositoryImpl();

    // Notifications infrastructure
    const notificationRepository = new NotificationRepositoryImpl();
    const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository);

    // Application layer: Chat use cases
    this.sendMessageUseCase = new SendMessageUseCase(this.messageRepository, this.conversationRepository, createNotificationUseCase);
    this.markMessageAsReadUseCase = new MarkMessageAsReadUseCase(this.messageRepository, this.conversationRepository);
    this.addReactionUseCase = new AddReactionUseCase();
    this.removeReactionUseCase = new RemoveReactionUseCase();
    const getMessagesUseCase = new GetMessagesUseCase(this.messageRepository, this.conversationRepository);
    const getConversationsUseCase = new GetConversationsUseCase(this.conversationRepository);
    const uploadMediaMessageUseCase = new UploadMediaMessageUseCase(this.messageRepository, this.conversationRepository);
    const searchMessagesUseCase = new SearchMessagesUseCase(this.messageRepository, this.conversationRepository);

    // Application layer: Group use cases
    const createGroupUseCase = new CreateGroupUseCase();
    const addGroupMemberUseCase = new AddGroupMemberUseCase(createNotificationUseCase);
    const removeGroupMemberUseCase = new RemoveGroupMemberUseCase();
    const leaveGroupUseCase = new LeaveGroupUseCase();

    // Interface layer: HTTP controllers
    const chatController = new ChatController(
      this.sendMessageUseCase,
      getMessagesUseCase,
      getConversationsUseCase,
      this.addReactionUseCase,
      this.removeReactionUseCase,
      uploadMediaMessageUseCase,
      searchMessagesUseCase
    );
    const groupController = new GroupController(
      createGroupUseCase,
      addGroupMemberUseCase,
      removeGroupMemberUseCase,
      leaveGroupUseCase
    );

    // Interface layer: Routes
    const chatRoutes = new ChatRoutes(chatController);
    const groupRoutes = new GroupRoutes(groupController);

    // Mount routes
    this.router = Router();
    this.router.use('/', chatRoutes.getRouter());
    this.router.use('/group', groupRoutes.getRouter());
  }

  /**
   * Get Express router with chat routes
   * 
   * @returns {Router} Express router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Initialize WebSocket server for real-time chat
   * 
   * @param {HTTPServer} httpServer - HTTP server instance
   * @returns {SocketServer} Socket.IO server instance
   */
  initializeWebSocket(httpServer: HTTPServer): SocketServer {
    if (this.socketServer) {
      console.warn('⚠️ Socket.IO server already initialized');
      return this.socketServer;
    }

    this.socketServer = new SocketServer(
      httpServer,
      this.sendMessageUseCase,
      this.markMessageAsReadUseCase,
      this.addReactionUseCase,
      this.removeReactionUseCase
    );
    return this.socketServer;
  }

  /**
   * Get Socket.IO server instance (if initialized)
   * 
   * @returns {SocketServer | undefined}
   */
  getSocketServer(): SocketServer | undefined {
    return this.socketServer;
  }
}

/**
 * Singleton instance of Chat Module
 * 
 * Export router and WebSocket initializer for use in main application.
 */
const chatModuleInstance = new ChatModule();

export const chatRouter = chatModuleInstance.getRouter();

export const initializeChatWebSocket = (httpServer: HTTPServer): SocketServer => {
  return chatModuleInstance.initializeWebSocket(httpServer);
};

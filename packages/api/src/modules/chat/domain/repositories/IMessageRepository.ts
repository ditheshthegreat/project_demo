/**
 * @file IMessageRepository.ts
 * @module Chat/Domain/Repositories
 * @layer Domain
 * @description Message Repository Interface (Port)
 */

import { Message } from '../entities/message.entity';

export interface IMessageRepository {
  /**
   * Create a new message
   */
  create(message: Message): Promise<Message>;

  /**
   * Find message by ID
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Get messages for a conversation with pagination
   */
  findByConversationId(
    conversationId: string,
    limit: number,
    offset: number
  ): Promise<Message[]>;

  /**
   * Get total message count for a conversation
   */
  countByConversationId(conversationId: string): Promise<number>;

  /**
   * Get messages sent by a specific user in a conversation
   */
  findByConversationAndSender(
    conversationId: string,
    senderId: string,
    limit: number,
    offset: number
  ): Promise<Message[]>;

  /**
   * Soft delete a message
   */
  softDelete(id: string): Promise<void>;

  /**
   * Check if a message exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Mark message as read
   */
  markAsRead(id: string): Promise<Message>;
}

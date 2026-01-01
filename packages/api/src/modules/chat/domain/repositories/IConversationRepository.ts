/**
 * @file IConversationRepository.ts
 * @module Chat/Domain/Repositories
 * @layer Domain
 * @description Conversation Repository Interface (Port) - Read-only access
 * 
 * Note: This is read-only from Chat module perspective.
 * Conversation creation/management happens in Community module.
 */

import { ConversationParticipant } from '../entities/conversationParticipant.entity';

export interface ConversationInfo {
  id: string;
  type: string;
  lastMessageAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationRepository {
  /**
   * Find conversation by ID
   */
  findById(id: string): Promise<ConversationInfo | null>;

  /**
   * Get all conversations for a user
   */
  findByUserId(userId: string): Promise<ConversationInfo[]>;

  /**
   * Get participants of a conversation
   */
  getParticipants(conversationId: string): Promise<ConversationParticipant[]>;

  /**
   * Check if user is participant in conversation
   */
  isParticipant(conversationId: string, userId: string): Promise<boolean>;

  /**
   * Find conversation between two users
   */
  findByParticipants(userId1: string, userId2: string): Promise<ConversationInfo | null>;

  /**
   * Update last message timestamp
   */
  updateLastMessageAt(conversationId: string, timestamp: Date): Promise<void>;
}

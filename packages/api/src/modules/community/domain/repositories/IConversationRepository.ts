/**
 * @file IConversationRepository.ts
 * @module Community/Domain/Repositories
 * @layer Domain
 * @description Conversation Repository Interface (Port)
 */

import { Conversation } from '../entities/conversation.entity';

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  
  findByParticipants(userId1: string, userId2: string): Promise<Conversation | null>;
  
  findByUserId(userId: string): Promise<Conversation[]>;
  
  create(conversation: Conversation): Promise<Conversation>;
  
  updateLastMessageAt(id: string, timestamp: Date): Promise<void>;
}

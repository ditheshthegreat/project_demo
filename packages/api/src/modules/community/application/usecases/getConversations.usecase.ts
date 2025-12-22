/**
 * @file getConversations.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get Conversations Use Case
 */

import { Conversation } from '../../domain/entities/conversation.entity';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';

export class GetConversationsUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository.findByUserId(userId);
  }
}

/**
 * @file startConversation.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Start Conversation Use Case
 */

import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../../domain/entities/conversation.entity';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { BadRequestException } from '../../../../shared/core/exceptions/AppException';

export class StartConversationUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(userId: string, recipientId: string): Promise<Conversation> {
    // Cannot start conversation with self
    if (userId === recipientId) {
      throw new BadRequestException('Cannot start conversation with yourself', 'INVALID_RECIPIENT');
    }

    // Check if conversation already exists
    const existing = await this.conversationRepository.findByParticipants(userId, recipientId);
    if (existing) {
      return existing;
    }

    // Create new conversation
    const conversation = Conversation.create({
      id: uuidv4(),
      participant1Id: userId,
      participant2Id: recipientId,
    });

    return await this.conversationRepository.create(conversation);
  }
}

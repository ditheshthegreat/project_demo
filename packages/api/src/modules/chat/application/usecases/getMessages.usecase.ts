/**
 * @file getMessages.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Get Messages Use Case
 */

import { Message } from '../../domain/entities/message.entity';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class GetMessagesUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(input: {
    conversationId: string;
    userId: string;
    limit?: number;
    offset?: number;
  }): Promise<{ messages: Message[]; total: number }> {
    // Security: Check if user is soft-deleted
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { isDeleted: true },
    });
    
    if (!user || user.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Verify conversation exists
    const conversation = await this.conversationRepository.findById(input.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is participant
    const isParticipant = await this.conversationRepository.isParticipant(
      input.conversationId,
      input.userId
    );
    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }

    const limit = Math.min(input.limit || 50, 100); // Max 100 messages per page
    const offset = input.offset || 0;

    // Get messages with pagination
    const messages = await this.messageRepository.findByConversationId(
      input.conversationId,
      limit,
      offset
    );

    // Get total count for pagination
    const total = await this.messageRepository.countByConversationId(input.conversationId);

    return { messages, total };
  }
}

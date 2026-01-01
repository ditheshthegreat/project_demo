/**
 * @file searchMessages.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Search Messages Use Case
 */

import { Message } from '../../domain/entities/message.entity';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class SearchMessagesUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(input: {
    query: string;
    userId: string;
    conversationId?: string;
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

    // Validate query
    if (!input.query || input.query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    const limit = Math.min(input.limit || 50, 100);
    const offset = input.offset || 0;

    // If conversationId is provided, verify user is participant
    if (input.conversationId) {
      const isParticipant = await this.conversationRepository.isParticipant(
        input.conversationId,
        input.userId
      );
      if (!isParticipant) {
        throw new Error('User is not a participant in this conversation');
      }

      // Search within specific conversation
      const messages = await this.searchInConversation(
        input.conversationId,
        input.query,
        limit,
        offset
      );

      const total = await this.countInConversation(
        input.conversationId,
        input.query
      );

      return { messages, total };
    }

    // Search across all user's conversations
    const userConversations = await prisma.conversationParticipant.findMany({
      where: { userId: input.userId },
      select: { conversationId: true },
    });

    const conversationIds = userConversations.map(cp => cp.conversationId);

    if (conversationIds.length === 0) {
      return { messages: [], total: 0 };
    }

    const messages = await this.searchAcrossConversations(
      conversationIds,
      input.query,
      limit,
      offset
    );

    const total = await this.countAcrossConversations(
      conversationIds,
      input.query
    );

    return { messages, total };
  }

  private async searchInConversation(
    conversationId: string,
    query: string,
    limit: number,
    offset: number
  ): Promise<Message[]> {
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
        isDeleted: false,
        content: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return messages.map(msg => this.messageRepository['mapToDomain'](msg));
  }

  private async countInConversation(
    conversationId: string,
    query: string
  ): Promise<number> {
    return await prisma.chatMessage.count({
      where: {
        conversationId,
        isDeleted: false,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
  }

  private async searchAcrossConversations(
    conversationIds: string[],
    query: string,
    limit: number,
    offset: number
  ): Promise<Message[]> {
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: { in: conversationIds },
        isDeleted: false,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return messages.map(msg => this.messageRepository['mapToDomain'](msg));
  }

  private async countAcrossConversations(
    conversationIds: string[],
    query: string
  ): Promise<number> {
    return await prisma.chatMessage.count({
      where: {
        conversationId: { in: conversationIds },
        isDeleted: false,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
  }
}

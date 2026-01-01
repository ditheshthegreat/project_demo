/**
 * @file conversationRepository.impl.ts
 * @module Chat/Infrastructure
 * @layer Infrastructure
 * @description Conversation Repository Implementation (Prisma Adapter) - Read-only
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { ConversationParticipant } from '../../domain/entities/conversationParticipant.entity';
import { IConversationRepository, ConversationInfo } from '../../domain/repositories/IConversationRepository';

export class ConversationRepositoryImpl implements IConversationRepository {
  async findById(id: string): Promise<ConversationInfo | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    return conversation ? this.mapToConversationInfo(conversation) : null;
  }

  async findByUserId(userId: string): Promise<ConversationInfo[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
        isDeleted: false,
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    return conversations.map(this.mapToConversationInfo);
  }

  async getParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
    });

    return participants.map(p => ConversationParticipant.create({
      id: p.id,
      conversationId: p.conversationId,
      userId: p.userId,
      joinedAt: p.joinedAt,
    }));
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const count = await prisma.conversationParticipant.count({
      where: {
        conversationId,
        userId,
      },
    });

    return count > 0;
  }

  async findByParticipants(userId1: string, userId2: string): Promise<ConversationInfo | null> {
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
        isDeleted: false,
      },
    });

    return conversation ? this.mapToConversationInfo(conversation) : null;
  }

  async updateLastMessageAt(conversationId: string, timestamp: Date): Promise<void> {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: timestamp },
    });
  }

  private mapToConversationInfo(prismaConversation: any): ConversationInfo {
    return {
      id: prismaConversation.id,
      type: prismaConversation.type,
      lastMessageAt: prismaConversation.lastMessageAt,
      createdById: prismaConversation.createdById,
      createdAt: prismaConversation.createdAt,
      updatedAt: prismaConversation.updatedAt,
    };
  }
}

/**
 * @file conversationRepository.impl.ts
 * @module Community/Infrastructure/Database
 * @layer Infrastructure
 * @description Conversation Repository Implementation using Prisma
 */

import { Conversation } from '../../domain/entities/conversation.entity';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class ConversationRepositoryImpl implements IConversationRepository {
  async findById(id: string): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!conversation || conversation.participants.length < 2) {
      return null;
    }

    return Conversation.create({
      id: conversation.id,
      participant1Id: conversation.participants[0].userId,
      participant2Id: conversation.participants[1].userId,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  }

  async findByParticipants(userId1: string, userId2: string): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: userId1 },
            },
          },
          {
            participants: {
              some: { userId: userId2 },
            },
          },
        ],
      },
      include: { participants: true },
    });

    if (!conversation) {
      return null;
    }

    return Conversation.create({
      id: conversation.id,
      participant1Id: userId1,
      participant2Id: userId2,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: { participants: true },
      orderBy: { lastMessageAt: 'desc' },
    });

    return conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId !== userId);
      return Conversation.create({
        id: conv.id,
        participant1Id: userId,
        participant2Id: otherParticipant?.userId || userId,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      });
    });
  }

  async create(conversation: Conversation): Promise<Conversation> {
    const created = await prisma.conversation.create({
      data: {
        id: conversation.id,
        type: 'PRIVATE',
        createdById: conversation.participant1Id,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        participants: {
          create: [
            { userId: conversation.participant1Id },
            { userId: conversation.participant2Id },
          ],
        },
      },
      include: { participants: true },
    });

    return Conversation.create({
      id: created.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      lastMessageAt: created.lastMessageAt,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async updateLastMessageAt(id: string, timestamp: Date): Promise<void> {
    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: timestamp, updatedAt: new Date() },
    });
  }
}

/**
 * @file addReaction.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Add Reaction to Message Use Case
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class AddReactionUseCase {
  async execute(input: {
    messageId: string;
    userId: string;
    emoji: string;
  }): Promise<any> {
    // Security: Check if user is soft-deleted
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { isDeleted: true },
    });
    
    if (!user || user.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Verify message exists and is not deleted
    const message = await prisma.chatMessage.findUnique({
      where: { id: input.messageId },
      select: { conversationId: true, isDeleted: true },
    });

    if (!message || message.isDeleted) {
      throw new Error('Message not found or deleted');
    }

    // Verify user is participant in conversation
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: message.conversationId,
        userId: input.userId,
      },
    });

    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }

    // Validate emoji (basic check for non-empty string)
    if (!input.emoji || input.emoji.trim().length === 0) {
      throw new Error('Emoji is required');
    }

    if (input.emoji.length > 10) {
      throw new Error('Emoji is too long');
    }

    // Upsert reaction (update if exists, create if not)
    const reaction = await prisma.messageReaction.upsert({
      where: {
        messageId_userId: {
          messageId: input.messageId,
          userId: input.userId,
        },
      },
      update: {
        emoji: input.emoji.trim(),
      },
      create: {
        messageId: input.messageId,
        userId: input.userId,
        emoji: input.emoji.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return {
      ...reaction,
      conversationId: message.conversationId,
    };
  }
}

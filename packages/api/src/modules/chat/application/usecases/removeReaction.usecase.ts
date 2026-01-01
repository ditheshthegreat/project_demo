/**
 * @file removeReaction.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Remove Reaction from Message Use Case
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class RemoveReactionUseCase {
  async execute(input: {
    messageId: string;
    userId: string;
  }): Promise<{ conversationId: string }> {
    // Security: Check if user is soft-deleted
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { isDeleted: true },
    });
    
    if (!user || user.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Verify message exists
    const message = await prisma.chatMessage.findUnique({
      where: { id: input.messageId },
      select: { conversationId: true },
    });

    if (!message) {
      throw new Error('Message not found');
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

    // Find and delete reaction
    const reaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId: {
          messageId: input.messageId,
          userId: input.userId,
        },
      },
    });

    if (!reaction) {
      throw new Error('Reaction not found');
    }

    await prisma.messageReaction.delete({
      where: { id: reaction.id },
    });

    return { conversationId: message.conversationId };
  }
}

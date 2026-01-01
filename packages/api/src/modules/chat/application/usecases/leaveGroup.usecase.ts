/**
 * @file leaveGroup.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Leave Group Use Case
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class LeaveGroupUseCase {
  async execute(input: {
    conversationId: string;
    userId: string;
  }): Promise<void> {
    // Verify conversation exists and is a GROUP
    const conversation = await prisma.conversation.findUnique({
      where: { id: input.conversationId },
      select: { type: true, isDeleted: true },
    });

    if (!conversation || conversation.isDeleted) {
      throw new Error('Conversation not found');
    }

    if (conversation.type !== 'GROUP') {
      throw new Error('Can only leave group conversations');
    }

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: input.conversationId,
          userId: input.userId,
        },
      },
    });

    if (!participant) {
      throw new Error('You are not a member of this group');
    }

    // Check if user is the last admin
    if (participant.role === 'ADMIN') {
      const adminCount = await prisma.conversationParticipant.count({
        where: {
          conversationId: input.conversationId,
          role: 'ADMIN' as any,
        },
      });

      if (adminCount === 1) {
        // Check if there are other members
        const memberCount = await prisma.conversationParticipant.count({
          where: {
            conversationId: input.conversationId,
          },
        });

        if (memberCount > 1) {
          throw new Error('Cannot leave: you are the last admin. Promote another member to admin first.');
        }
      }
    }

    // Remove participant
    await prisma.conversationParticipant.delete({
      where: {
        id: participant.id,
      },
    });

    // If no participants left, mark conversation as deleted
    const remainingCount = await prisma.conversationParticipant.count({
      where: { conversationId: input.conversationId },
    });

    if (remainingCount === 0) {
      await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    }
  }
}

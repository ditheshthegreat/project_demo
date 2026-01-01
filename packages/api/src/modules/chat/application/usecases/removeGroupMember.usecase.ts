/**
 * @file removeGroupMember.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Remove Member from Group Use Case
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class RemoveGroupMemberUseCase {
  async execute(input: {
    conversationId: string;
    adminId: string;
    userIdToRemove: string;
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
      throw new Error('Can only remove members from group conversations');
    }

    // Verify admin is ADMIN in this group
    const adminParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: input.conversationId,
        userId: input.adminId,
        role: 'ADMIN' as any,
      },
    });

    if (!adminParticipant) {
      throw new Error('Only group admins can remove members');
    }

    // Cannot remove yourself (use leave endpoint)
    if (input.adminId === input.userIdToRemove) {
      throw new Error('Use leave endpoint to leave the group');
    }

    // Verify user to remove is a participant
    const participantToRemove = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: input.conversationId,
          userId: input.userIdToRemove,
        },
      },
    });

    if (!participantToRemove) {
      throw new Error('User is not a member of this group');
    }

    // Remove participant
    await prisma.conversationParticipant.delete({
      where: {
        id: participantToRemove.id,
      },
    });
  }
}

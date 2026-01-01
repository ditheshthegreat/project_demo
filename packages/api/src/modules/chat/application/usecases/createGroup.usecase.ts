/**
 * @file createGroup.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Create Group Conversation Use Case
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class CreateGroupUseCase {
  async execute(input: {
    creatorId: string;
    name: string;
    participantIds: string[];
  }): Promise<any> {
    // Security: Check if creator is soft-deleted
    const creator = await prisma.user.findUnique({
      where: { id: input.creatorId },
      select: { isDeleted: true },
    });
    
    if (!creator || creator.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Validate group name
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Group name is required');
    }

    if (input.name.trim().length > 100) {
      throw new Error('Group name is too long (max 100 characters)');
    }

    // Validate participants (minimum 2 participants + creator = 3 total)
    if (!input.participantIds || input.participantIds.length < 2) {
      throw new Error('Group must have at least 3 participants including creator');
    }

    // Remove duplicates and ensure creator is not in participant list
    const uniqueParticipantIds = [...new Set(input.participantIds)].filter(
      id => id !== input.creatorId
    );

    // Verify all participants exist and are not deleted
    const participants = await prisma.user.findMany({
      where: {
        id: { in: uniqueParticipantIds },
        isDeleted: false,
      },
      select: { id: true },
    });

    if (participants.length !== uniqueParticipantIds.length) {
      throw new Error('One or more participants not found or deleted');
    }

    // Create group conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        type: 'GROUP',
        name: input.name.trim(),
        createdById: input.creatorId,
        participants: {
          create: [
            // Creator as ADMIN
            {
              userId: input.creatorId,
              role: 'ADMIN' as any,
            },
            // Other participants as MEMBER
            ...uniqueParticipantIds.map(userId => ({
              userId,
              role: 'MEMBER' as any,
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }
}

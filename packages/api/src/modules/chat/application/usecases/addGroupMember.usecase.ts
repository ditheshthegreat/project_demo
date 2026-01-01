/**
 * @file addGroupMember.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Add Member to Group Use Case
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { CreateNotificationUseCase } from '../../../notifications/application/usecases/createNotification.usecase';
import { NotificationType } from '../../../notifications/domain/entities/notification.entity';

export class AddGroupMemberUseCase {
  constructor(private readonly createNotificationUseCase: CreateNotificationUseCase) {}

  async execute(input: {
    conversationId: string;
    adminId: string;
    userIdToAdd: string;
  }): Promise<any> {
    // Verify conversation exists and is a GROUP
    const conversation = await prisma.conversation.findUnique({
      where: { id: input.conversationId },
      select: { type: true, isDeleted: true },
    });

    if (!conversation || conversation.isDeleted) {
      throw new Error('Conversation not found');
    }

    if (conversation.type !== 'GROUP') {
      throw new Error('Can only add members to group conversations');
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
      throw new Error('Only group admins can add members');
    }

    // Verify user to add exists and is not deleted
    const userToAdd = await prisma.user.findUnique({
      where: { id: input.userIdToAdd },
      select: { isDeleted: true, name: true },
    });

    if (!userToAdd || userToAdd.isDeleted) {
      throw new Error('User to add not found or deleted');
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: input.conversationId,
          userId: input.userIdToAdd,
        },
      },
    });

    if (existingParticipant) {
      throw new Error('User is already a member of this group');
    }

    // Add user as MEMBER
    const participant = await prisma.conversationParticipant.create({
      data: {
        conversationId: input.conversationId,
        userId: input.userIdToAdd,
        role: 'MEMBER' as any,
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

    // Send notification to added user (after member is added)
    await this.sendGroupAddNotification(input.userIdToAdd, input.adminId, input.conversationId);

    return participant;
  }

  /**
   * Send notification for being added to group
   * Uses CreateNotificationUseCase - includes self-check and FCM sending
   */
  private async sendGroupAddNotification(
    addedUserId: string,
    adminId: string,
    conversationId: string
  ): Promise<void> {
    try {
      // Get admin name for notification body
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { name: true },
      });

      if (!admin) {
        return;
      }

      // CreateNotificationUseCase handles:
      // - Self-notification prevention (receiverId === actorId)
      // - Database insertion
      // - FCM push sending (fire-and-forget)
      await this.createNotificationUseCase.execute({
        userId: addedUserId,
        actorId: adminId,
        type: NotificationType.SYSTEM,
        entityId: conversationId,
        title: 'Added to group',
        body: `${admin.name} added you to a group chat`,
      });
    } catch (error) {
      // Fail silently - notifications should never break group functionality
      console.error('[AddGroupMember] Failed to send notification:', error);
    }
  }
}

/**
 * @file acceptFriendRequest.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Accept Friend Request Use Case
 */

import { Friend } from '../../domain/entities/friend.entity';
import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';
import { CreateNotificationUseCase } from '../../../notifications/application/usecases/createNotification.usecase';
import { NotificationType } from '../../../notifications/domain/entities/notification.entity';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class AcceptFriendRequestUseCase {
  constructor(
    private readonly friendRepository: IFriendRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase
  ) {}

  async execute(requestId: string, userId: string): Promise<Friend> {
    const request = await this.friendRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Friend request not found', 'REQUEST_NOT_FOUND');
    }

    // Only the recipient can accept
    if (request.friendId !== userId) {
      throw new ForbiddenException('You cannot accept this request', 'FORBIDDEN');
    }

    if (request.status !== 'pending') {
      throw new ForbiddenException('Request is no longer pending', 'REQUEST_NOT_PENDING');
    }

    const acceptedRequest = await this.friendRepository.updateStatus(requestId, 'accepted');

    // Send notification to request sender (after friendship is created)
    await this.sendAcceptanceNotification(request.userId, userId);

    return acceptedRequest;
  }

  /**
   * Send notification for friend request acceptance
   * Uses CreateNotificationUseCase - includes self-check and FCM sending
   */
  private async sendAcceptanceNotification(
    requestSenderId: string,
    acceptorId: string
  ): Promise<void> {
    try {
      // Get acceptor name for notification body
      const acceptor = await prisma.user.findUnique({
        where: { id: acceptorId },
        select: { name: true },
      });

      if (!acceptor) {
        return;
      }

      // CreateNotificationUseCase handles:
      // - Self-notification prevention (receiverId === actorId)
      // - Database insertion
      // - FCM push sending (fire-and-forget)
      await this.createNotificationUseCase.execute({
        userId: requestSenderId,
        actorId: acceptorId,
        type: NotificationType.SYSTEM,
        entityId: acceptorId,
        title: 'Friend request accepted',
        body: `${acceptor.name} accepted your friend request`,
      });
    } catch (error) {
      // Fail silently - notifications should never break acceptance functionality
      console.error('[AcceptFriendRequest] Failed to send notification:', error);
    }
  }
}

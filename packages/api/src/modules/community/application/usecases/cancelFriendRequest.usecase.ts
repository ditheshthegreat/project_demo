/**
 * @file cancelFriendRequest.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Cancel Friend Request Use Case - Cancel a sent pending friend request
 */

import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class CancelFriendRequestUseCase {
  constructor(private readonly friendRepository: IFriendRepository) {}

  async execute(userId: string, requestId: string): Promise<void> {
    // Find the friend request by ID
    const friendRequest = await this.friendRepository.findById(requestId);

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found', 'REQUEST_NOT_FOUND');
    }

    // Only the sender can cancel the request
    if (friendRequest.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own friend requests', 'FORBIDDEN');
    }

    // Only pending requests can be cancelled
    if (friendRequest.status !== 'pending') {
      throw new ForbiddenException('Only pending requests can be cancelled', 'INVALID_STATUS');
    }

    // Update status to cancelled and soft delete to preserve the final state
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: {
        status: 'cancelled',
        deletedAt: new Date(),
      },
    });
  }
}

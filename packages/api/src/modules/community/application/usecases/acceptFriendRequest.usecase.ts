/**
 * @file acceptFriendRequest.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Accept Friend Request Use Case
 */

import { Friend } from '../../domain/entities/friend.entity';
import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';

export class AcceptFriendRequestUseCase {
  constructor(private readonly friendRepository: IFriendRepository) {}

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

    return await this.friendRepository.updateStatus(requestId, 'accepted');
  }
}

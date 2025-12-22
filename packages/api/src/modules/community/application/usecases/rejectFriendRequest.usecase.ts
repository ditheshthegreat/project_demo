/**
 * @file rejectFriendRequest.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Reject Friend Request Use Case
 */

import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';

export class RejectFriendRequestUseCase {
  constructor(private readonly friendRepository: IFriendRepository) {}

  async execute(requestId: string, userId: string): Promise<void> {
    const request = await this.friendRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Friend request not found', 'REQUEST_NOT_FOUND');
    }

    // Only the recipient can reject
    if (request.friendId !== userId) {
      throw new ForbiddenException('You cannot reject this request', 'FORBIDDEN');
    }

    if (request.status !== 'pending') {
      throw new ForbiddenException('Request is no longer pending', 'REQUEST_NOT_PENDING');
    }

    await this.friendRepository.updateStatus(requestId, 'rejected');
  }
}

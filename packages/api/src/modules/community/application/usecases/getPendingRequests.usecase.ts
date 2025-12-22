/**
 * @file getPendingRequests.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get Pending Friend Requests Use Case
 */

import { Friend } from '../../domain/entities/friend.entity';
import { IFriendRepository } from '../../domain/repositories/IFriendRepository';

export class GetPendingRequestsUseCase {
  constructor(private readonly friendRepository: IFriendRepository) {}

  async execute(userId: string): Promise<Friend[]> {
    return await this.friendRepository.findPendingRequestsReceived(userId);
  }
}

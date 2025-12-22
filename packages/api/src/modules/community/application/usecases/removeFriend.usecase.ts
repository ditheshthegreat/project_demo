/**
 * @file removeFriend.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Remove Friend Use Case
 */

import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { NotFoundException } from '../../../../shared/core/exceptions/AppException';

export class RemoveFriendUseCase {
  constructor(private readonly friendRepository: IFriendRepository) {}

  async execute(userId: string, friendId: string): Promise<void> {
    // Check if friendship exists and is accepted
    const friendship = await this.friendRepository.findByUsers(userId, friendId);
    
    if (!friendship || friendship.status !== 'accepted') {
      throw new NotFoundException('Friendship not found', 'FRIENDSHIP_NOT_FOUND');
    }

    // Soft delete the friendship (both directions)
    await this.friendRepository.deleteByUsers(userId, friendId);
  }
}

/**
 * @file getFriends.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get Friends List Use Case
 */

import { Friend } from '../../domain/entities/friend.entity';
import { IFriendRepository } from '../../domain/repositories/IFriendRepository';

export class GetFriendsUseCase {
  constructor(private readonly friendRepository: IFriendRepository) {}

  async execute(userId: string): Promise<Friend[]> {
    return await this.friendRepository.findFriendsByUserId(userId);
  }
}

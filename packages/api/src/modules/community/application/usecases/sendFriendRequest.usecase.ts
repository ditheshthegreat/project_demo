/**
 * @file sendFriendRequest.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Send Friend Request Use Case
 */

import { v4 as uuidv4 } from 'uuid';
import { Friend } from '../../domain/entities/friend.entity';
import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { ConflictException, NotFoundException, BadRequestException } from '../../../../shared/core/exceptions/AppException';

export class SendFriendRequestUseCase {
  constructor(private readonly friendRepository: IFriendRepository) {}

  async execute(senderId: string, recipientId: string): Promise<Friend> {
    // Cannot send request to self
    if (senderId === recipientId) {
      throw new BadRequestException('Cannot send friend request to yourself', 'INVALID_REQUEST');
    }

    // Check if friendship or pending request already exists
    const existing = await this.friendRepository.findByUsers(senderId, recipientId);
    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictException('Already friends with this user', 'ALREADY_FRIENDS');
      }
      if (existing.status === 'pending') {
        throw new ConflictException('Friend request already exists', 'REQUEST_EXISTS');
      }
    }

    // Create friend request
    const friendRequest = Friend.create({
      id: uuidv4(),
      userId: senderId,
      friendId: recipientId,
      status: 'pending',
    });

    return await this.friendRepository.create(friendRequest);
  }
}

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
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class SendFriendRequestUseCase {
  constructor(private readonly friendRepository: IFriendRepository) {}

  async execute(senderId: string, recipientId: string): Promise<Friend> {
    // Cannot send request to self
    if (senderId === recipientId) {
      throw new BadRequestException('Cannot send friend request to yourself', 'INVALID_REQUEST');
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, isDeleted: true }
    });

    if (!recipient || recipient.isDeleted) {
      throw new NotFoundException('Recipient user not found', 'USER_NOT_FOUND');
    }

    // Check if friendship already exists
    const existingFriendship = await this.friendRepository.areFriends(senderId, recipientId);
    if (existingFriendship) {
      throw new ConflictException('Already friends with this user', 'ALREADY_FRIENDS');
    }

    // Check if there's a pending request from recipient to sender (mutual request scenario)
    const reverseRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: recipientId,
        receiverId: senderId,
        status: 'pending',
        deletedAt: null,
      },
    });

    if (reverseRequest) {
      // Mutual request detected - auto-accept and create friendship
      const acceptedTime = new Date();
      
      // Delete any existing friendship records (from previous unfriend scenarios)
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId: reverseRequest.senderId, friendId: reverseRequest.receiverId },
            { userId: reverseRequest.receiverId, friendId: reverseRequest.senderId },
          ],
        },
      });

      await prisma.friendship.create({
        data: {
          userId: reverseRequest.senderId,
          friendId: reverseRequest.receiverId,
          status: 'accepted',
          acceptedAt: acceptedTime,
        },
      });

      await prisma.friendship.create({
        data: {
          userId: reverseRequest.receiverId,
          friendId: reverseRequest.senderId,
          status: 'accepted',
          acceptedAt: acceptedTime,
        },
      });

      // Update status to accepted and soft delete to preserve the final state
      await prisma.friendRequest.update({
        where: { id: reverseRequest.id },
        data: {
          status: 'accepted',
          deletedAt: new Date(),
        },
      });

      return Friend.create({
        id: reverseRequest.id,
        userId: reverseRequest.senderId,
        friendId: reverseRequest.receiverId,
        status: 'accepted',
        acceptedAt: acceptedTime,
        createdAt: reverseRequest.createdAt,
        updatedAt: new Date(),
      });
    }

    // Check if sender already sent a request to recipient (non-deleted only)
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: senderId,
        receiverId: recipientId,
        status: 'pending',
        deletedAt: null,
      },
    });

    if (existingRequest) {
      throw new ConflictException('Friend request already exists', 'REQUEST_EXISTS');
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

/**
 * @file friendRepository.impl.ts
 * @module Community/Infrastructure/Database
 * @layer Infrastructure
 * @description Friend Repository Implementation using Prisma
 */

import { Friend } from '../../domain/entities/friend.entity';
import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class FriendRepositoryImpl implements IFriendRepository {
  async findById(id: string): Promise<Friend | null> {
    const friendship = await prisma.friendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      return null;
    }

    return Friend.create({
      id: friendship.id,
      userId: friendship.userId,
      friendId: friendship.friendId,
      status: friendship.status as any,
      acceptedAt: friendship.acceptedAt,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
    });
  }

  async findByUsers(userId1: string, userId2: string): Promise<Friend | null> {
    // Check friendship first
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId1, friendId: userId2 },
          { userId: userId2, friendId: userId1 },
        ],
      },
    });

    if (friendship) {
      return Friend.create({
        id: friendship.id,
        userId: friendship.userId,
        friendId: friendship.friendId,
        status: friendship.status as any,
        acceptedAt: friendship.acceptedAt,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
      });
    }

    // Check pending request
    const request = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        status: 'pending',
      },
    });

    if (!request) {
      return null;
    }

    return Friend.create({
      id: request.id,
      userId: request.senderId,
      friendId: request.receiverId,
      status: 'pending',
      acceptedAt: null,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    });
  }

  async findFriendsByUserId(userId: string, limit?: number, offset?: number): Promise<Friend[]> {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId },
          { friendId: userId },
        ],
        status: 'accepted',
      },
      orderBy: { acceptedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return friendships.map(friendship => Friend.create({
      id: friendship.id,
      userId: friendship.userId,
      friendId: friendship.friendId,
      status: friendship.status as any,
      acceptedAt: friendship.acceptedAt,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
    }));
  }

  async findPendingRequestsReceived(userId: string): Promise<Friend[]> {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(req => Friend.create({
      id: req.id,
      userId: req.senderId,
      friendId: req.receiverId,
      status: 'pending',
      acceptedAt: null,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    }));
  }

  async findPendingRequestsSent(userId: string): Promise<Friend[]> {
    const requests = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(req => Friend.create({
      id: req.id,
      userId: req.senderId,
      friendId: req.receiverId,
      status: 'pending',
      acceptedAt: null,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    }));
  }

  async findByUserIdAndStatus(userId: string, status: any): Promise<Friend[]> {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId },
          { friendId: userId },
        ],
        status,
      },
      orderBy: { createdAt: 'desc' },
    });

    return friendships.map(friendship => Friend.create({
      id: friendship.id,
      userId: friendship.userId,
      friendId: friendship.friendId,
      status: friendship.status as any,
      acceptedAt: friendship.acceptedAt,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
    }));
  }

  async countFriendsByUserId(userId: string): Promise<number> {
    return await prisma.friendship.count({
      where: {
        OR: [
          { userId },
          { friendId: userId },
        ],
        status: 'accepted',
      },
    });
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId1, friendId: userId2 },
          { userId: userId2, friendId: userId1 },
        ],
        status: 'accepted',
      },
    });

    return friendship !== null;
  }

  async friendshipExists(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId1, friendId: userId2 },
          { userId: userId2, friendId: userId1 },
        ],
      },
    });

    const request = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
    });

    return friendship !== null || request !== null;
  }


  async create(friend: Friend): Promise<Friend> {
    const request = await prisma.friendRequest.create({
      data: {
        id: friend.id,
        senderId: friend.userId,
        receiverId: friend.friendId,
        status: 'pending',
        createdAt: friend.createdAt,
        updatedAt: friend.updatedAt,
      },
    });

    return Friend.create({
      id: request.id,
      userId: request.senderId,
      friendId: request.receiverId,
      status: 'pending',
      acceptedAt: null,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    });
  }

  async updateStatus(id: string, status: any, acceptedAt?: Date): Promise<Friend> {
    // Check if it's a friend request
    const request = await prisma.friendRequest.findUnique({
      where: { id },
    });

    if (request) {
      // Update request status
      await prisma.friendRequest.update({
        where: { id },
        data: { status },
      });

      // If accepting, create mutual friendship records
      if (status === 'accepted') {
        const acceptedTime = acceptedAt || new Date();
        
        await prisma.friendship.create({
          data: {
            userId: request.senderId,
            friendId: request.receiverId,
            status: 'accepted',
            acceptedAt: acceptedTime,
          },
        });

        await prisma.friendship.create({
          data: {
            userId: request.receiverId,
            friendId: request.senderId,
            status: 'accepted',
            acceptedAt: acceptedTime,
          },
        });

        return Friend.create({
          id: request.id,
          userId: request.senderId,
          friendId: request.receiverId,
          status: 'accepted',
          acceptedAt: acceptedTime,
          createdAt: request.createdAt,
          updatedAt: new Date(),
        });
      }

      return Friend.create({
        id: request.id,
        userId: request.senderId,
        friendId: request.receiverId,
        status,
        acceptedAt: null,
        createdAt: request.createdAt,
        updatedAt: new Date(),
      });
    }

    // Check if it's a friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      throw new Error('Friend request or friendship not found');
    }

    const updated = await prisma.friendship.update({
      where: { id },
      data: { status, acceptedAt },
    });

    return Friend.create({
      id: updated.id,
      userId: updated.userId,
      friendId: updated.friendId,
      status: updated.status as any,
      acceptedAt: updated.acceptedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async deleteByUsers(userId1: string, userId2: string): Promise<void> {
    // Soft delete both friendship directions
    await prisma.friendship.updateMany({
      where: {
        OR: [
          { userId: userId1, friendId: userId2 },
          { userId: userId2, friendId: userId1 },
        ],
      },
      data: { status: 'removed' },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.friendRequest.delete({
      where: { id },
    });
  }
}

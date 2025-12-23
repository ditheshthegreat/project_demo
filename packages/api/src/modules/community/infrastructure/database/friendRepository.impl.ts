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
    // Check FriendRequest table first (pending requests)
    const request = await prisma.friendRequest.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (request) {
      return Friend.create({
        id: request.id,
        userId: request.senderId,
        friendId: request.receiverId,
        status: request.status as any,
        acceptedAt: null,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    }

    // Check Friendship table (accepted friendships)
    const friendship = await prisma.friendship.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
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
        deletedAt: null,
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
        deletedAt: null,
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
        userId,
        status: 'accepted',
        deletedAt: null,
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
        deletedAt: null,
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
        deletedAt: null,
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
        deletedAt: null,
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
        deletedAt: null,
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
        deletedAt: null,
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
        deletedAt: null,
      },
    });

    const request = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        deletedAt: null,
      },
    });

    return friendship !== null || request !== null;
  }

  async create(friend: Friend): Promise<Friend> {
    // Delete any existing friend request between these users (handles stale rejected/cancelled requests)
    await prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: friend.userId, receiverId: friend.friendId },
          { senderId: friend.friendId, receiverId: friend.userId },
        ],
      },
    });

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
    const request = await prisma.friendRequest.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (request) {
      // If accepting, create mutual friendship records and soft delete with status preserved
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

        // Update status to accepted and soft delete to preserve the final state
        await prisma.friendRequest.update({
          where: { id },
          data: { 
            status: 'accepted',
            deletedAt: new Date(),
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

      // For reject, update status and soft delete to preserve the final state
      if (status === 'rejected') {
        await prisma.friendRequest.update({
          where: { id },
          data: { 
            status: 'rejected',
            deletedAt: new Date(),
          },
        });

        return Friend.create({
          id: request.id,
          userId: request.senderId,
          friendId: request.receiverId,
          status: 'rejected',
          acceptedAt: null,
          createdAt: request.createdAt,
          updatedAt: new Date(),
        });
      }

      // For other status updates
      await prisma.friendRequest.update({
        where: { id },
        data: { status },
      });

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
    const friendship = await prisma.friendship.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
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
    // Soft delete friendship records - status is already preserved (accepted/blocked)
    // Just set deletedAt to mark as removed while keeping the final state
    await prisma.friendship.updateMany({
      where: {
        OR: [
          { userId: userId1, friendId: userId2 },
          { userId: userId2, friendId: userId1 },
        ],
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    // Soft delete friend request records - status is already preserved if any exist
    await prisma.friendRequest.updateMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    // Soft delete from friend requests
    await prisma.friendRequest.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    // Soft delete from friendships
    await prisma.friendship.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}

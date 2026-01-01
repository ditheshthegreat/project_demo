/**
 * @file blockedUser.repository.impl.ts
 * @module Community/Infrastructure
 * @layer Infrastructure
 * @description BlockedUser Repository Implementation (Prisma Adapter)
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { BlockedUser } from '../../domain/entities/blockedUser.entity';
import { IBlockedUserRepository } from '../../domain/repositories/IBlockedUserRepository';

export class BlockedUserRepositoryImpl implements IBlockedUserRepository {
  async blockUser(blockerId: string, blockedId: string): Promise<BlockedUser> {
    const blocked = await prisma.blockedUser.create({
      data: {
        blockerId,
        blockedId,
      },
    });

    return this.mapToDomain(blocked);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await prisma.blockedUser.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await prisma.blockedUser.findFirst({
      where: {
        blockerId,
        blockedId,
      },
    });

    return block !== null;
  }

  async getBlockedUsers(blockerId: string): Promise<BlockedUser[]> {
    const blocks = await prisma.blockedUser.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
    });

    return blocks.map(this.mapToDomain);
  }

  async isBlockedByEither(userId1: string, userId2: string): Promise<boolean> {
    const block = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userId1, blockedId: userId2 },
          { blockerId: userId2, blockedId: userId1 },
        ],
      },
    });

    return block !== null;
  }

  private mapToDomain(prismaBlock: any): BlockedUser {
    return BlockedUser.create({
      id: prismaBlock.id,
      blockerId: prismaBlock.blockerId,
      blockedId: prismaBlock.blockedId,
      createdAt: prismaBlock.createdAt,
    });
  }
}

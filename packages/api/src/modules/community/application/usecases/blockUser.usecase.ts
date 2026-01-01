/**
 * @file blockUser.usecase.ts
 * @module Community/Application
 * @layer Application
 * @description Block User Use Case
 */

import { BlockedUser } from '../../domain/entities/blockedUser.entity';
import { IBlockedUserRepository } from '../../domain/repositories/IBlockedUserRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class BlockUserUseCase {
  constructor(private readonly blockedUserRepository: IBlockedUserRepository) {}

  async execute(input: {
    blockerId: string;
    blockedId: string;
  }): Promise<BlockedUser> {
    // Validate: Cannot block yourself
    if (input.blockerId === input.blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Security: Check if blocker is soft-deleted
    const blocker = await prisma.user.findUnique({
      where: { id: input.blockerId },
      select: { isDeleted: true },
    });

    if (!blocker || blocker.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Verify blocked user exists and is not deleted
    const blockedUser = await prisma.user.findUnique({
      where: { id: input.blockedId },
      select: { isDeleted: true },
    });

    if (!blockedUser || blockedUser.isDeleted) {
      throw new Error('User to block not found');
    }

    // Check if already blocked
    const alreadyBlocked = await this.blockedUserRepository.isBlocked(
      input.blockerId,
      input.blockedId
    );

    if (alreadyBlocked) {
      throw new Error('User is already blocked');
    }

    // Block the user
    const block = await this.blockedUserRepository.blockUser(
      input.blockerId,
      input.blockedId
    );

    return block;
  }
}

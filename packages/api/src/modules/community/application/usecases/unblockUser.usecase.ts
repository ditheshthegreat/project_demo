/**
 * @file unblockUser.usecase.ts
 * @module Community/Application
 * @layer Application
 * @description Unblock User Use Case
 */

import { IBlockedUserRepository } from '../../domain/repositories/IBlockedUserRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class UnblockUserUseCase {
  constructor(private readonly blockedUserRepository: IBlockedUserRepository) {}

  async execute(input: {
    blockerId: string;
    blockedId: string;
  }): Promise<void> {
    // Security: Check if user is soft-deleted
    const blocker = await prisma.user.findUnique({
      where: { id: input.blockerId },
      select: { isDeleted: true },
    });

    if (!blocker || blocker.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Check if user is actually blocked
    const isBlocked = await this.blockedUserRepository.isBlocked(
      input.blockerId,
      input.blockedId
    );

    if (!isBlocked) {
      throw new Error('User is not blocked');
    }

    // Unblock the user
    await this.blockedUserRepository.unblockUser(
      input.blockerId,
      input.blockedId
    );
  }
}

/**
 * @file getBlockedUsers.usecase.ts
 * @module Community/Application
 * @layer Application
 * @description Get Blocked Users Use Case
 */

import { BlockedUser } from '../../domain/entities/blockedUser.entity';
import { IBlockedUserRepository } from '../../domain/repositories/IBlockedUserRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class GetBlockedUsersUseCase {
  constructor(private readonly blockedUserRepository: IBlockedUserRepository) {}

  async execute(input: {
    userId: string;
  }): Promise<BlockedUser[]> {
    // Security: Check if user is soft-deleted
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { isDeleted: true },
    });

    if (!user || user.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Get all blocked users
    const blockedUsers = await this.blockedUserRepository.getBlockedUsers(
      input.userId
    );

    return blockedUsers;
  }
}

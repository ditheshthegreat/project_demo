/**
 * @file IBlockedUserRepository.ts
 * @module Community/Domain
 * @layer Domain
 * @description BlockedUser Repository Interface
 */

import { BlockedUser } from '../entities/blockedUser.entity';

export interface IBlockedUserRepository {
  /**
   * Block a user
   */
  blockUser(blockerId: string, blockedId: string): Promise<BlockedUser>;

  /**
   * Unblock a user
   */
  unblockUser(blockerId: string, blockedId: string): Promise<void>;

  /**
   * Check if a user is blocked
   */
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;

  /**
   * Get all users blocked by a user
   */
  getBlockedUsers(blockerId: string): Promise<BlockedUser[]>;

  /**
   * Check if either user has blocked the other
   */
  isBlockedByEither(userId1: string, userId2: string): Promise<boolean>;
}

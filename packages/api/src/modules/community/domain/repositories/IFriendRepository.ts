/**
 * @file IFriendRepository.ts
 * @module Community/Domain/Repositories
 * @layer Domain
 * @description Friend Repository Interface (Port)
 * 
 * Defines the contract for friendship data persistence operations.
 * This is a port in Clean Architecture - implementations belong to infrastructure layer.
 * 
 * **Responsibilities:**
 * - Define methods for CRUD operations on Friend entities
 * - Abstract away database implementation details
 * - Support bidirectional friendship queries
 * - Handle friendship status transitions
 * 
 * @example
 * class FriendRepositoryImpl implements IFriendRepository {
 *   async findById(id: string): Promise<Friend | null> { ... }
 * }
 */

import { Friend, FriendshipStatus } from '../entities/friend.entity';

/**
 * Friend Repository Interface
 * 
 * Contract for friendship persistence operations.
 * Implemented by infrastructure layer (e.g., Prisma).
 */
export interface IFriendRepository {
  /**
   * Find friendship by database ID
   * @param id - Database UUID
   * @returns Friend entity or null if not found
   */
  findById(id: string): Promise<Friend | null>;
  
  /**
   * Find friendship between two users (bidirectional)
   * Checks both directions: user1->user2 and user2->user1
   * @param userId1 - First user's UUID
   * @param userId2 - Second user's UUID
   * @returns Friend entity or null if not found
   */
  findByUsers(userId1: string, userId2: string): Promise<Friend | null>;
  
  /**
   * Find all friends for a specific user (accepted friendships only)
   * @param userId - User's UUID
   * @param limit - Maximum number of friends to return
   * @param offset - Number of friends to skip (for pagination)
   * @returns Array of Friend entities
   */
  findFriendsByUserId(userId: string, limit?: number, offset?: number): Promise<Friend[]>;
  
  /**
   * Find pending friend requests received by a user
   * @param userId - User's UUID (recipient)
   * @returns Array of Friend entities with status 'pending'
   */
  findPendingRequestsReceived(userId: string): Promise<Friend[]>;
  
  /**
   * Find pending friend requests sent by a user
   * @param userId - User's UUID (initiator)
   * @returns Array of Friend entities with status 'pending'
   */
  findPendingRequestsSent(userId: string): Promise<Friend[]>;
  
  /**
   * Find all friendships for a user with specific status
   * @param userId - User's UUID
   * @param status - Friendship status
   * @returns Array of Friend entities
   */
  findByUserIdAndStatus(userId: string, status: FriendshipStatus): Promise<Friend[]>;
  
  /**
   * Count total friends for a user (accepted friendships only)
   * @param userId - User's UUID
   * @returns Number of friends
   */
  countFriendsByUserId(userId: string): Promise<number>;
  
  /**
   * Check if two users are friends (accepted friendship)
   * @param userId1 - First user's UUID
   * @param userId2 - Second user's UUID
   * @returns True if users are friends, false otherwise
   */
  areFriends(userId1: string, userId2: string): Promise<boolean>;
  
  /**
   * Check if friendship exists between two users (any status)
   * @param userId1 - First user's UUID
   * @param userId2 - Second user's UUID
   * @returns True if friendship exists, false otherwise
   */
  friendshipExists(userId1: string, userId2: string): Promise<boolean>;
  
  /**
   * Create a new friend request
   * @param friend - Friend entity to create
   * @returns Created Friend entity
   * @throws Error if friendship already exists
   */
  create(friend: Friend): Promise<Friend>;
  
  /**
   * Update friendship status
   * @param id - Friendship database ID
   * @param status - New status
   * @param acceptedAt - Timestamp when accepted (for accepted status)
   * @returns Updated Friend entity
   */
  updateStatus(id: string, status: FriendshipStatus, acceptedAt?: Date): Promise<Friend>;
  
  /**
   * Delete friendship by ID
   * @param id - Database UUID
   */
  delete(id: string): Promise<void>;
  
  /**
   * Delete friendship between two users
   * @param userId1 - First user's UUID
   * @param userId2 - Second user's UUID
   */
  deleteByUsers(userId1: string, userId2: string): Promise<void>;
}

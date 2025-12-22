/**
 * @file ILikeRepository.ts
 * @module Community/Domain/Repositories
 * @layer Domain
 * @description Like Repository Interface (Port)
 * 
 * Defines the contract for like data persistence operations.
 * This is a port in Clean Architecture - implementations belong to infrastructure layer.
 * 
 * **Responsibilities:**
 * - Define methods for CRUD operations on Like entities
 * - Abstract away database implementation details
 * - Support post-based and user-based queries
 * - Enforce unique constraint (one like per user per post)
 * 
 * @example
 * class LikeRepositoryImpl implements ILikeRepository {
 *   async findById(id: string): Promise<Like | null> { ... }
 * }
 */

import { Like } from '../entities/like.entity';

/**
 * Like Repository Interface
 * 
 * Contract for like persistence operations.
 * Implemented by infrastructure layer (e.g., Prisma).
 */
export interface ILikeRepository {
  /**
   * Find like by database ID
   * @param id - Database UUID
   * @returns Like entity or null if not found
   */
  findById(id: string): Promise<Like | null>;
  
  /**
   * Find like by post ID and user ID
   * Used to check if user has already liked a post
   * @param postId - Post's UUID
   * @param userId - User's UUID
   * @returns Like entity or null if not found
   */
  findByPostAndUser(postId: string, userId: string): Promise<Like | null>;
  
  /**
   * Find all likes for a specific post
   * @param postId - Post's UUID
   * @param limit - Maximum number of likes to return
   * @param offset - Number of likes to skip (for pagination)
   * @returns Array of Like entities
   */
  findByPostId(postId: string, limit?: number, offset?: number): Promise<Like[]>;
  
  /**
   * Find all likes by a specific user
   * @param userId - User's UUID
   * @param limit - Maximum number of likes to return
   * @param offset - Number of likes to skip (for pagination)
   * @returns Array of Like entities
   */
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Like[]>;
  
  /**
   * Count likes for a specific post
   * @param postId - Post's UUID
   * @returns Number of likes
   */
  countByPostId(postId: string): Promise<number>;
  
  /**
   * Check if user has liked a post
   * @param postId - Post's UUID
   * @param userId - User's UUID
   * @returns True if user has liked the post, false otherwise
   */
  hasUserLikedPost(postId: string, userId: string): Promise<boolean>;
  
  /**
   * Create a new like
   * @param like - Like entity to create
   * @returns Created Like entity
   * @throws Error if user has already liked the post (unique constraint)
   */
  create(like: Like): Promise<Like>;
  
  /**
   * Delete like by ID
   * @param id - Database UUID
   */
  delete(id: string): Promise<void>;
  
  /**
   * Delete like by post ID and user ID
   * Used when user unlikes a post
   * @param postId - Post's UUID
   * @param userId - User's UUID
   */
  deleteByPostAndUser(postId: string, userId: string): Promise<void>;
  
  /**
   * Delete all likes for a specific post
   * Used when a post is deleted
   * @param postId - Post's UUID
   */
  deleteByPostId(postId: string): Promise<void>;
}

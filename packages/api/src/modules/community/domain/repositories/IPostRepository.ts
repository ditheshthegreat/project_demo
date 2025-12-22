/**
 * @file IPostRepository.ts
 * @module Community/Domain/Repositories
 * @layer Domain
 * @description Post Repository Interface (Port)
 * 
 * Defines the contract for post data persistence operations.
 * This is a port in Clean Architecture - implementations belong to infrastructure layer.
 * 
 * **Responsibilities:**
 * - Define methods for CRUD operations on FeedPost entities
 * - Abstract away database implementation details
 * - Support user-based and post-based queries
 * 
 * @example
 * class PostRepositoryImpl implements IPostRepository {
 *   async findById(id: string): Promise<FeedPost | null> { ... }
 * }
 */

import { FeedPost } from '../entities/feedPost.entity';

/**
 * Post Repository Interface
 * 
 * Contract for post persistence operations.
 * Implemented by infrastructure layer (e.g., Prisma).
 */
export interface IPostRepository {
  /**
   * Find post by database ID
   * @param id - Database UUID
   * @returns FeedPost entity or null if not found
   */
  findById(id: string): Promise<FeedPost | null>;
  
  /**
   * Find all posts by a specific user
   * @param userId - User's UUID
   * @param limit - Maximum number of posts to return
   * @param offset - Number of posts to skip (for pagination)
   * @returns Array of FeedPost entities
   */
  findByUserId(userId: string, limit?: number, offset?: number): Promise<FeedPost[]>;
  
  /**
   * Find posts for user's feed (posts from friends and own posts)
   * @param userId - User's UUID
   * @param limit - Maximum number of posts to return
   * @param offset - Number of posts to skip (for pagination)
   * @returns Array of FeedPost entities ordered by creation date
   */
  findFeedPosts(userId: string, limit?: number, offset?: number): Promise<FeedPost[]>;
  
  /**
   * Create a new post
   * @param post - FeedPost entity to create
   * @returns Created FeedPost entity
   */
  create(post: FeedPost): Promise<FeedPost>;
  
  /**
   * Update existing post
   * @param id - Post database ID
   * @param data - Partial post data to update
   * @returns Updated FeedPost entity
   */
  update(id: string, data: Partial<{
    content: string;
    imageUrl: string | null;
  }>): Promise<FeedPost>;
  
  /**
   * Increment likes count
   * @param id - Post database ID
   * @returns Updated FeedPost entity
   */
  incrementLikesCount(id: string): Promise<FeedPost>;
  
  /**
   * Decrement likes count
   * @param id - Post database ID
   * @returns Updated FeedPost entity
   */
  decrementLikesCount(id: string): Promise<FeedPost>;
  
  /**
   * Increment comments count
   * @param id - Post database ID
   * @returns Updated FeedPost entity
   */
  incrementCommentsCount(id: string): Promise<FeedPost>;
  
  /**
   * Decrement comments count
   * @param id - Post database ID
   * @returns Updated FeedPost entity
   */
  decrementCommentsCount(id: string): Promise<FeedPost>;
  
  /**
   * Soft delete post by ID
   * @param id - Database UUID
   */
  softDelete(id: string): Promise<void>;
  
  /**
   * Hard delete post by ID
   * @param id - Database UUID
   */
  delete(id: string): Promise<void>;
}

/**
 * @file ICommentRepository.ts
 * @module Community/Domain/Repositories
 * @layer Domain
 * @description Comment Repository Interface (Port)
 * 
 * Defines the contract for comment data persistence operations.
 * This is a port in Clean Architecture - implementations belong to infrastructure layer.
 * 
 * **Responsibilities:**
 * - Define methods for CRUD operations on Comment entities
 * - Abstract away database implementation details
 * - Support post-based and user-based queries
 * 
 * @example
 * class CommentRepositoryImpl implements ICommentRepository {
 *   async findById(id: string): Promise<Comment | null> { ... }
 * }
 */

import { Comment } from '../entities/comment.entity';

/**
 * Comment Repository Interface
 * 
 * Contract for comment persistence operations.
 * Implemented by infrastructure layer (e.g., Prisma).
 */
export interface ICommentRepository {
  /**
   * Find comment by database ID
   * @param id - Database UUID
   * @returns Comment entity or null if not found
   */
  findById(id: string): Promise<Comment | null>;
  
  /**
   * Find all comments for a specific post
   * @param postId - Post's UUID
   * @param limit - Maximum number of comments to return
   * @param offset - Number of comments to skip (for pagination)
   * @returns Array of Comment entities ordered by creation date
   */
  findByPostId(postId: string, limit?: number, offset?: number): Promise<Comment[]>;
  
  /**
   * Find all comments by a specific user
   * @param userId - User's UUID
   * @param limit - Maximum number of comments to return
   * @param offset - Number of comments to skip (for pagination)
   * @returns Array of Comment entities
   */
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Comment[]>;
  
  /**
   * Count comments for a specific post
   * @param postId - Post's UUID
   * @returns Number of comments
   */
  countByPostId(postId: string): Promise<number>;
  
  /**
   * Create a new comment
   * @param comment - Comment entity to create
   * @returns Created Comment entity
   */
  create(comment: Comment): Promise<Comment>;
  
  /**
   * Update existing comment
   * @param id - Comment database ID
   * @param data - Partial comment data to update
   * @returns Updated Comment entity
   */
  update(id: string, data: Partial<{
    content: string;
  }>): Promise<Comment>;
  
  /**
   * Soft delete comment by ID
   * @param id - Database UUID
   */
  softDelete(id: string): Promise<void>;
  
  /**
   * Hard delete comment by ID
   * @param id - Database UUID
   */
  delete(id: string): Promise<void>;
  
  /**
   * Delete all comments for a specific post
   * Used when a post is deleted
   * @param postId - Post's UUID
   */
  deleteByPostId(postId: string): Promise<void>;
}

/**
 * @file like.entity.ts
 * @module Community/Domain
 * @layer Domain
 * @description Like Entity - Post Like
 * 
 * Represents a like on a feed post by users.
 * 
 * **Business Rules:**
 * - Each like must belong to a post
 * - Each like must have an author (userId)
 * - A user can only like a post once (unique constraint)
 * - Likes cannot be edited, only created or removed
 * 
 * **Domain Invariants:**
 * - ID must be a valid UUID
 * - postId must reference an existing post
 * - userId must reference an existing user
 * - Combination of postId + userId must be unique
 * - createdAt cannot be in the future
 * 
 * @example
 * const like = Like.create({
 *   id: 'uuid',
 *   postId: 'post-uuid',
 *   userId: 'user-uuid',
 *   createdAt: new Date()
 * });
 */

/**
 * Like Properties Interface
 */
export interface LikeProps {
  /** Database unique identifier (UUID) */
  id: string;
  
  /** Post ID this like belongs to */
  postId: string;
  
  /** User ID who liked the post */
  userId: string;
  
  /** Like creation timestamp */
  createdAt: Date;
}

/**
 * Like Entity
 * 
 * Core domain entity representing a like on a post.
 */
export class Like {
  constructor(private readonly props: LikeProps) {}

  /**
   * Factory method to create a new Like instance
   * 
   * @param {Partial<LikeProps>} props - Like properties
   * @returns {Like} New Like instance
   */
  public static create(props: Partial<LikeProps> & { id: string; postId: string; userId: string }): Like {
    return new Like({
      id: props.id,
      postId: props.postId,
      userId: props.userId,
      createdAt: props.createdAt || new Date(),
    });
  }

  /**
   * Get like's database ID
   */
  public get id(): string {
    return this.props.id;
  }

  /**
   * Get post ID
   */
  public get postId(): string {
    return this.props.postId;
  }

  /**
   * Get user ID who liked
   */
  public get userId(): string {
    return this.props.userId;
  }

  /**
   * Get creation timestamp
   */
  public get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Check if like can be removed
   * Business rule: Likes can only be removed by the user who created them
   */
  public canBeRemovedBy(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Convert like entity to JSON-serializable object
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      postId: this.postId,
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }
}

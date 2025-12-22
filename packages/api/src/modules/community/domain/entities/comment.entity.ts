/**
 * @file comment.entity.ts
 * @module Community/Domain
 * @layer Domain
 * @description Comment Entity - Post Comment
 * 
 * Represents a comment on a feed post by users.
 * 
 * **Business Rules:**
 * - Each comment must belong to a post
 * - Each comment must have an author (userId)
 * - Content cannot be empty (enforced at validation layer)
 * - Comments can be edited by the author
 * - Deleted comments are soft-deleted
 * 
 * **Domain Invariants:**
 * - ID must be a valid UUID
 * - postId must reference an existing post
 * - userId must reference an existing user
 * - createdAt cannot be in the future
 * 
 * @example
 * const comment = Comment.create({
 *   id: 'uuid',
 *   postId: 'post-uuid',
 *   userId: 'user-uuid',
 *   content: 'Great post!',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 */

/**
 * Comment Properties Interface
 */
export interface CommentProps {
  /** Database unique identifier (UUID) */
  id: string;
  
  /** Post ID this comment belongs to */
  postId: string;
  
  /** Author's user ID */
  userId: string;
  
  /** Comment content text */
  content: string;
  
  /** Soft delete flag */
  isDeleted: boolean;
  
  /** Deletion timestamp */
  deletedAt: Date | null;
  
  /** Comment creation timestamp */
  createdAt: Date;
  
  /** Last modification timestamp */
  updatedAt: Date;
}

/**
 * Comment Entity
 * 
 * Core domain entity representing a comment on a post.
 */
export class Comment {
  constructor(private readonly props: CommentProps) {}

  /**
   * Factory method to create a new Comment instance
   * 
   * @param {Partial<CommentProps>} props - Comment properties
   * @returns {Comment} New Comment instance
   */
  public static create(props: Partial<CommentProps> & { id: string; postId: string; userId: string; content: string }): Comment {
    return new Comment({
      id: props.id,
      postId: props.postId,
      userId: props.userId,
      content: props.content,
      isDeleted: props.isDeleted || false,
      deletedAt: props.deletedAt || null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  /**
   * Get comment's database ID
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
   * Get author's user ID
   */
  public get userId(): string {
    return this.props.userId;
  }

  /**
   * Get comment content
   */
  public get content(): string {
    return this.props.content;
  }

  /**
   * Check if comment is soft-deleted
   */
  public get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  /**
   * Get deletion timestamp
   */
  public get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  /**
   * Get creation timestamp
   */
  public get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Get last update timestamp
   */
  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Check if comment can be edited
   * Business rule: Comments can be edited by the author
   */
  public canBeEditedBy(userId: string): boolean {
    return this.userId === userId && !this.isDeleted;
  }

  /**
   * Check if comment can be deleted
   * Business rule: Comments can be deleted by the author
   */
  public canBeDeletedBy(userId: string): boolean {
    return this.userId === userId && !this.isDeleted;
  }

  /**
   * Convert comment entity to JSON-serializable object
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      postId: this.postId,
      userId: this.userId,
      content: this.content,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * @file feedPost.entity.ts
 * @module Community/Domain
 * @layer Domain
 * @description FeedPost Entity - Community Post
 * 
 * Represents a post in the community feed created by users.
 * 
 * **Business Rules:**
 * - Each post must have an author (userId)
 * - Content cannot be empty (enforced at validation layer)
 * - Posts can have optional images
 * - Posts must have a feed type (photo, location, review)
 * - Posts must have visibility setting (public, friends, private)
 * - Posts can be edited within business rules
 * - Deleted posts are soft-deleted
 * 
 * **Domain Invariants:**
 * - ID must be a valid UUID
 * - userId must reference an existing user
 * - feedType must be valid (photo, location, review)
 * - visibility must be valid (public, friends, private)
 * - createdAt cannot be in the future
 * - If edited, updatedAt must be after createdAt
 * 
 * @example
 * const post = FeedPost.create({
 *   id: 'uuid',
 *   userId: 'user-uuid',
 *   feedType: 'photo',
 *   visibility: 'public',
 *   content: 'Hello community!',
 *   imageUrl: 'https://...',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 */

import { FeedType, Visibility } from '../constants/feed.constants';

/**
 * FeedPost Properties Interface
 */
export interface FeedPostProps {
  /** Database unique identifier (UUID) */
  id: string;
  
  /** Author's user ID */
  userId: string;
  
  /** Feed type (photo, location, review) */
  feedType: FeedType;
  
  /** Visibility setting (public, friends, private) */
  visibility: Visibility;
  
  /** Post content text */
  content: string;
  
  /** Optional image URL (backward compatibility) */
  imageUrl: string | null;
  
  /** Array of image metadata (max 5) */
  images: Array<{
    id: string;
    s3Key: string;
    url: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    width?: number;
    height?: number;
    order: number;
  }>;
  
  /** Number of likes (denormalized for performance) */
  likesCount: number;
  
  /** Number of comments (denormalized for performance) */
  commentsCount: number;
  
  /** Soft delete flag */
  isDeleted: boolean;
  
  /** Deletion timestamp */
  deletedAt: Date | null;
  
  /** Post creation timestamp */
  createdAt: Date;
  
  /** Last modification timestamp */
  updatedAt: Date;
}

/**
 * FeedPost Entity
 * 
 * Core domain entity representing a community post.
 */
export class FeedPost {
  constructor(private readonly props: FeedPostProps) {}

  /**
   * Factory method to create a new FeedPost instance
   * 
   * @param {Partial<FeedPostProps>} props - Post properties
   * @returns {FeedPost} New FeedPost instance
   */
  public static create(props: Partial<FeedPostProps> & { id: string; userId: string; feedType: FeedType; visibility: Visibility; content: string }): FeedPost {
    return new FeedPost({
      id: props.id,
      userId: props.userId,
      feedType: props.feedType,
      visibility: props.visibility,
      content: props.content,
      imageUrl: props.imageUrl || null,
      images: props.images || [],
      likesCount: props.likesCount || 0,
      commentsCount: props.commentsCount || 0,
      isDeleted: props.isDeleted || false,
      deletedAt: props.deletedAt || null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  /**
   * Get post's database ID
   */
  public get id(): string {
    return this.props.id;
  }

  /**
   * Get author's user ID
   */
  public get userId(): string {
    return this.props.userId;
  }

  /**
   * Get feed type
   */
  public get feedType(): FeedType {
    return this.props.feedType;
  }

  /**
   * Get visibility setting
   */
  public get visibility(): Visibility {
    return this.props.visibility;
  }

  /**
   * Get post content
   */
  public get content(): string {
    return this.props.content;
  }

  /**
   * Get image URL
   */
  public get imageUrl(): string | null {
    return this.props.imageUrl;
  }

  /**
   * Get images array
   */
  public get images(): Array<{
    id: string;
    s3Key: string;
    url: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    width?: number;
    height?: number;
    order: number;
  }> {
    return this.props.images;
  }

  /**
   * Get likes count
   */
  public get likesCount(): number {
    return this.props.likesCount;
  }

  /**
   * Get comments count
   */
  public get commentsCount(): number {
    return this.props.commentsCount;
  }

  /**
   * Check if post is soft-deleted
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
   * Check if post can be edited
   * Business rule: Posts can be edited by the author
   */
  public canBeEditedBy(userId: string): boolean {
    return this.userId === userId && !this.isDeleted;
  }

  /**
   * Check if post can be deleted
   * Business rule: Posts can be deleted by the author
   */
  public canBeDeletedBy(userId: string): boolean {
    return this.userId === userId && !this.isDeleted;
  }

  /**
   * Convert post entity to JSON-serializable object
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      content: this.content,
      imageUrl: this.imageUrl,
      images: this.images,
      likesCount: this.likesCount,
      commentsCount: this.commentsCount,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

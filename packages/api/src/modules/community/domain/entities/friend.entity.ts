/**
 * @file friend.entity.ts
 * @module Community/Domain
 * @layer Domain
 * @description Friend Entity - Friendship Relationship
 * 
 * Represents a friendship relationship between two users.
 * 
 * **Business Rules:**
 * - Friendship requires two users (userId and friendId)
 * - Friendship must be accepted (pending/accepted/rejected status)
 * - A user cannot be friends with themselves
 * - Friendship is bidirectional once accepted
 * - Only the recipient can accept or reject a friend request
 * - Friendship can be ended by either party
 * 
 * **Domain Invariants:**
 * - ID must be a valid UUID
 * - userId must reference an existing user
 * - friendId must reference an existing user
 * - userId cannot equal friendId
 * - Status must be one of: pending, accepted, rejected, blocked
 * - createdAt cannot be in the future
 * 
 * @example
 * const friendship = Friend.create({
 *   id: 'uuid',
 *   userId: 'user1-uuid',
 *   friendId: 'user2-uuid',
 *   status: 'pending',
 *   createdAt: new Date()
 * });
 */

/**
 * Friendship Status Types
 */
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

/**
 * Friend Properties Interface
 */
export interface FriendProps {
  /** Database unique identifier (UUID) */
  id: string;
  
  /** User who initiated the friendship */
  userId: string;
  
  /** User who received the friend request */
  friendId: string;
  
  /** Status of the friendship */
  status: FriendshipStatus;
  
  /** When friendship was accepted (null if not accepted) */
  acceptedAt: Date | null;
  
  /** Friend request creation timestamp */
  createdAt: Date;
  
  /** Last modification timestamp */
  updatedAt: Date;
}

/**
 * Friend Entity
 * 
 * Core domain entity representing a friendship relationship.
 */
export class Friend {
  constructor(private readonly props: FriendProps) {}

  /**
   * Factory method to create a new Friend instance
   * 
   * @param {Partial<FriendProps>} props - Friend properties
   * @returns {Friend} New Friend instance
   */
  public static create(props: Partial<FriendProps> & { id: string; userId: string; friendId: string }): Friend {
    // Business rule: User cannot be friends with themselves
    if (props.userId === props.friendId) {
      throw new Error('User cannot be friends with themselves');
    }

    return new Friend({
      id: props.id,
      userId: props.userId,
      friendId: props.friendId,
      status: props.status || 'pending',
      acceptedAt: props.acceptedAt || null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  /**
   * Get friendship's database ID
   */
  public get id(): string {
    return this.props.id;
  }

  /**
   * Get user ID who initiated the friendship
   */
  public get userId(): string {
    return this.props.userId;
  }

  /**
   * Get friend's user ID
   */
  public get friendId(): string {
    return this.props.friendId;
  }

  /**
   * Get friendship status
   */
  public get status(): FriendshipStatus {
    return this.props.status;
  }

  /**
   * Get acceptance timestamp
   */
  public get acceptedAt(): Date | null {
    return this.props.acceptedAt;
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
   * Check if friendship is pending
   */
  public isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Check if friendship is accepted
   */
  public isAccepted(): boolean {
    return this.status === 'accepted';
  }

  /**
   * Check if friendship is rejected
   */
  public isRejected(): boolean {
    return this.status === 'rejected';
  }

  /**
   * Check if friendship is blocked
   */
  public isBlocked(): boolean {
    return this.status === 'blocked';
  }

  /**
   * Check if user can accept the friend request
   * Business rule: Only the recipient can accept
   */
  public canBeAcceptedBy(userId: string): boolean {
    return this.friendId === userId && this.status === 'pending';
  }

  /**
   * Check if user can reject the friend request
   * Business rule: Only the recipient can reject
   */
  public canBeRejectedBy(userId: string): boolean {
    return this.friendId === userId && this.status === 'pending';
  }

  /**
   * Check if user can cancel the friend request
   * Business rule: Only the initiator can cancel while pending
   */
  public canBeCancelledBy(userId: string): boolean {
    return this.userId === userId && this.status === 'pending';
  }

  /**
   * Check if user can end the friendship
   * Business rule: Either party can end an accepted friendship
   */
  public canBeEndedBy(userId: string): boolean {
    return (this.userId === userId || this.friendId === userId) && this.status === 'accepted';
  }

  /**
   * Check if user can block
   * Business rule: Either party can block
   */
  public canBeBlockedBy(userId: string): boolean {
    return this.userId === userId || this.friendId === userId;
  }

  /**
   * Convert friend entity to JSON-serializable object
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      friendId: this.friendId,
      status: this.status,
      acceptedAt: this.acceptedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * @file user.entity.ts
 * @module Auth/Domain
 * @layer Domain
 * @description User Entity - Firebase-Authenticated User Profile
 * 
 * Represents a user account in the INKLUSIO system. Authentication is handled
 * by Firebase (email/password, Google, Apple) on the Flutter frontend.
 * This entity only stores user profile information synced from Firebase.
 * 
 * **Business Rules:**
 * - Each user must have a unique Firebase UID
 * - Firebase UID cannot be changed after account creation
 * - Email is optional (some providers don't provide email)
 * - Name defaults to email username if not provided
 * 
 * **Domain Invariants:**
 * - ID must be a valid UUID
 * - firebaseUid must be unique and non-null
 * - createdAt cannot be in the future
 * 
 * **Authentication:**
 * - Authentication handled by Firebase on Flutter frontend
 * - Backend only verifies Firebase ID tokens
 * - No password storage on backend
 * 
 * **Used By:**
 * - UserRepository: For persistence operations
 * - VerifyUserUseCase: For user profile sync
 * - Protected routes: For authorization checks
 * 
 * @example
 * // Create a Firebase-synced user
 * const user = User.create({
 *   id: 'uuid-here',
 *   firebaseUid: 'firebase-uid-here',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 */

/**
 * User Properties Interface
 * 
 * Defines the complete set of properties that make up a User entity.
 * Simplified for Firebase authentication.
 * 
 * @interface UserProps
 */
export interface UserProps {
  /** Database unique identifier (UUID) */
  id: string;
  
  /** Firebase Authentication UID (unique, immutable) */
  firebaseUid: string;
  
  /** User's display name */
  name: string | null;
  
  /** User's email address (optional, from Firebase) */
  email: string | null;
  
  /** User's phone number */
  phone: string | null;
  
  /** Profile image URL */
  profileImage: string | null;
  
  /** Gender */
  gender: string | null;
  
  /** Age */
  age: number | null;
  
  /** Location data (JSON) */
  location: any;
  
  /** Accessibility needs (JSON) */
  accessibility: any;
  
  /** User preferences (JSON) */
  preferences: any;
  
  /** Soft delete flag */
  isDeleted: boolean;
  
  /** Deletion timestamp */
  deletedAt: Date | null;
  
  /** Account creation timestamp */
  createdAt: Date;
  
  /** Last modification timestamp */
  updatedAt: Date;
}

/**
 * User Entity
 * 
 * Core domain entity representing a user profile synced from Firebase.
 * 
 * @class User
 */
export class User {
  /**
   * Creates a User entity instance
   * 
   * @param {UserProps} props - Complete user properties
   * 
   * @example
   * const user = new User({
   *   id: 'uuid',
   *   firebaseUid: 'firebase-uid',
   *   email: 'user@example.com',
   *   name: 'John Doe',
   *   createdAt: new Date(),
   *   updatedAt: new Date()
   * });
   */
  constructor(private readonly props: UserProps) {}

  /**
   * Factory method to create a new User instance from Firebase data
   * 
   * @param {Partial<UserProps>} props - User properties
   * @returns {User} New User instance
   */
  public static create(props: Partial<UserProps> & { id: string; firebaseUid: string }): User {
    return new User({
      id: props.id,
      firebaseUid: props.firebaseUid,
      name: props.name || props.email?.split('@')[0] || 'User',
      email: props.email || null,
      phone: props.phone || null,
      profileImage: props.profileImage || null,
      gender: props.gender || null,
      age: props.age || null,
      location: props.location || null,
      accessibility: props.accessibility || null,
      preferences: props.preferences || null,
      isDeleted: props.isDeleted || false,
      deletedAt: props.deletedAt || null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  /**
   * Get user's database ID
   * 
   * @returns {string} UUID of the user in database
   */
  public get id(): string {
    return this.props.id;
  }

  /**
   * Get user's Firebase UID
   * 
   * @returns {string} Firebase Authentication UID
   */
  public get firebaseUid(): string {
    return this.props.firebaseUid;
  }

  /**
   * Get user's email address
   * 
   * @returns {string|null} User's email from Firebase
   */
  public get email(): string | null {
    return this.props.email;
  }

  /**
   * Get user's display name
   * 
   * @returns {string|null} User's display name
   */
  public get name(): string | null {
    return this.props.name;
  }

  /**
   * Get user's account creation timestamp
   * 
   * @returns {Date} When the user account was created
   */
  public get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Get user's last modification timestamp
   * 
   * @returns {Date} When the user account was last updated
   */
  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Get user's phone number
   */
  public get phone(): string | null {
    return this.props.phone;
  }

  /**
   * Get user's profile image URL
   */
  public get profileImage(): string | null {
    return this.props.profileImage;
  }

  /**
   * Get user's gender
   */
  public get gender(): string | null {
    return this.props.gender;
  }

  /**
   * Get user's age
   */
  public get age(): number | null {
    return this.props.age;
  }

  /**
   * Get user's location data
   */
  public get location(): any {
    return this.props.location;
  }

  /**
   * Get user's accessibility needs
   */
  public get accessibility(): any {
    return this.props.accessibility;
  }

  /**
   * Get user's preferences
   */
  public get preferences(): any {
    return this.props.preferences;
  }

  /**
   * Check if user is soft-deleted
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
   * Convert user entity to JSON-serializable object
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      firebaseUid: this.firebaseUid,
      name: this.name,
      email: this.email,
      phone: this.phone,
      profileImage: this.profileImage,
      gender: this.gender,
      age: this.age,
      location: this.location,
      accessibility: this.accessibility,
      preferences: this.preferences,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

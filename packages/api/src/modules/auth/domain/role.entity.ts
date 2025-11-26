/**
 * @file role.entity.ts
 * @module Auth/Domain
 * @layer Domain
 * @description Role Entity - User Role Management
 * 
 * Represents a user role in the INKLUSIO system for access control.
 * 
 * **Available Roles:**
 * - user: Regular user (default)
 * - moderator: Can moderate content
 * - admin: Full system access
 * 
 * **Business Rules:**
 * - Each user can have multiple roles
 * - Role names are case-insensitive
 * - Cannot have duplicate roles per user
 * 
 * @example
 * const role = Role.create({
 *   id: 'uuid',
 *   name: 'admin',
 *   userId: 'user-uuid',
 *   createdAt: new Date()
 * });
 */

/**
 * Role names enum
 */
export enum RoleName {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

/**
 * Role Properties Interface
 */
export interface RoleProps {
  /** Database unique identifier (UUID) */
  id: string;
  
  /** Role name */
  name: string;
  
  /** User ID this role belongs to */
  userId: string;
  
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Role Entity
 * 
 * Core domain entity representing a user role.
 */
export class Role {
  constructor(private readonly props: RoleProps) {}

  /**
   * Factory method to create a new Role instance
   */
  public static create(
    id: string,
    name: string,
    userId: string,
    createdAt?: Date
  ): Role {
    return new Role({
      id,
      name: name.toLowerCase(),
      userId,
      createdAt: createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Check if this is an admin role
   */
  public isAdmin(): boolean {
    return this.props.name === RoleName.ADMIN;
  }

  /**
   * Check if this is a moderator role
   */
  public isModerator(): boolean {
    return this.props.name === RoleName.MODERATOR;
  }

  /**
   * Check if this is a regular user role
   */
  public isUser(): boolean {
    return this.props.name === RoleName.USER;
  }
}

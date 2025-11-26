/**
 * @file IUserRepository.ts
 * @module Auth/Domain/Repositories
 * @layer Domain
 * @description User Repository Interface (Port)
 * 
 * Defines the contract for user data persistence operations.
 * This is a port in Clean Architecture - implementations belong to infrastructure layer.
 * 
 * **Responsibilities:**
 * - Define methods for CRUD operations on User entities
 * - Abstract away database implementation details
 * - Support Firebase UID-based lookups
 * 
 * @example
 * class UserRepositoryImpl implements IUserRepository {
 *   async findByFirebaseUid(uid: string): Promise<User | null> { ... }
 * }
 */

import { User } from "../user.entity";

/**
 * User Repository Interface
 * 
 * Contract for user persistence operations.
 * Implemented by infrastructure layer (e.g., Prisma, MongoDB).
 */
export interface IUserRepository {
  /**
   * Find user by database ID
   * @param id - Database UUID
   * @returns User entity or null if not found
   */
  findById(id: string): Promise<User | null>;
  
  /**
   * Find user by Firebase UID
   * @param firebaseUid - Firebase Authentication UID
   * @returns User entity or null if not found
   */
  findByFirebaseUid(firebaseUid: string): Promise<User | null>;
  
  /**
   * Find user by email address
   * @param email - User's email
   * @returns User entity or null if not found
   */
  findByEmail(email: string): Promise<User | null>;
  
  /**
   * Create a new user
   * @param user - User entity to create
   * @returns Created user entity
   */
  create(user: User): Promise<User>;
  
  /**
   * Update existing user
   * @param id - User database ID
   * @param data - Partial user data to update
   * @returns Updated user entity
   */
  update(id: string, data: Partial<{
    name?: string;
    phone?: string;
    age?: number;
    gender?: string;
    location?: any;
    accessibility?: any;
    preferences?: any;
    profileImage?: string;
  }>): Promise<User>;
  
  /**
   * Soft delete user by ID
   * @param id - Database UUID
   */
  softDelete(id: string): Promise<void>;
  
  /**
   * Hard delete user by ID
   * @param id - Database UUID
   */
  delete(id: string): Promise<void>;
}

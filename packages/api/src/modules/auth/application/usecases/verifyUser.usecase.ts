/**
 * @file verifyUser.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Verify User Use Case - Sync Firebase User with Database
 * 
 * This use case handles user verification and synchronization between Firebase
 * Authentication and the local database. When a Firebase-authenticated user
 * accesses the API, this ensures their profile exists in our database.
 * 
 * **Business Logic:**
 * - Check if user exists in database by Firebase UID
 * - If not found, create new user record with Firebase data
 * - If found, optionally update profile information
 * - Return user entity for authorization checks
 * 
 * **Flow:**
 * 1. Flutter authenticates user with Firebase (email/Google/Apple)
 * 2. Flutter sends Firebase ID token to backend
 * 3. Middleware verifies token and extracts user data
 * 4. This use case ensures user exists in database
 * 5. User can now access protected resources
 * 
 * **Used By:**
 * - /auth/verify endpoint
 * - Any protected route that needs user profile
 * 
 * @example
 * const useCase = new VerifyUserUseCase(userRepository);
 * const user = await useCase.execute({
 *   uid: 'firebase-uid-123',
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 */

import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/user.entity";
import { randomUUID } from "crypto";

/**
 * Firebase User Input DTO
 * 
 * Data extracted from Firebase ID token by middleware.
 */
export interface FirebaseUserDTO {
  /** Firebase Authentication UID */
  uid: string;
  
  /** User's email (optional for some providers) */
  email?: string;
  
  /** User's display name from Firebase */
  name?: string;
}

/**
 * Verify User Use Case
 * 
 * Ensures Firebase-authenticated users are synced with local database.
 * Creates new users or returns existing users.
 */
export class VerifyUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute user verification and sync
   * 
   * @param {FirebaseUserDTO} firebaseUser - User data from Firebase token
   * @returns {Promise<User>} User entity (existing or newly created)
   * 
   * @example
   * const user = await verifyUserUseCase.execute({
   *   uid: 'firebase-uid',
   *   email: 'user@example.com',
   *   name: 'John Doe'
   * });
   */
  async execute(firebaseUser: FirebaseUserDTO): Promise<User> {
    // Try to find existing user by Firebase UID
    let user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);

    if (!user) {
      // User doesn't exist - create new record
      const newUser = User.create({
        id: randomUUID(),
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || null,
        name: firebaseUser.name || firebaseUser.email?.split('@')[0] || 'User',
      });

      user = await this.userRepository.create(newUser);
    }

    // TODO: Optionally update user profile if Firebase data changed
    // This could sync name/email changes from Firebase to our database

    return user;
  }
}

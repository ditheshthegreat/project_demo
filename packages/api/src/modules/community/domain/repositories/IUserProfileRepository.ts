/**
 * @file IUserProfileRepository.ts
 * @module Community/Domain/Repositories
 * @layer Domain
 * @description User Profile Repository Interface (Port)
 * 
 * Defines the contract for user profile discovery operations.
 */

export interface UserProfile {
  id: string;
  firebaseUid: string;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  gender: string | null;
  city: string | null;
  federalState: string | null;
  interests: string[];
  hobbies: string[];
  accessibilityRequirements: string[];
  description: string | null;
  onboardingCompleted: boolean;
}

export interface ExploreFilters {
  name?: string;
  interests?: string[];
  skills?: string[];
  accessibilityNeeds?: string[];
  distanceKm?: number;
  limit?: number;
  offset?: number;
}

/**
 * User Profile Repository Interface
 * 
 * Contract for user profile discovery operations.
 */
export interface IUserProfileRepository {
  /**
   * Explore users with optional filters
   * @param currentUserId - Current user's Firebase UID (to exclude)
   * @param filters - Optional filters
   * @returns Array of user profiles
   */
  explore(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]>;
  
  /**
   * Search users by name and filters
   * @param currentUserId - Current user's Firebase UID (to exclude)
   * @param filters - Search filters (name required)
   * @returns Array of user profiles
   */
  search(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]>;
  
  /**
   * Find nearby users based on location
   * @param currentUserId - Current user's Firebase UID
   * @param filters - Filters with distance
   * @returns Array of user profiles
   */
  nearby(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]>;
}

/**
 * @file IRoleRepository.ts
 * @module Auth/Domain/Repositories
 * @layer Domain
 * @description Role Repository Interface
 */

import { Role } from '../role.entity';

export interface IRoleRepository {
  /**
   * Find all roles for a user
   */
  findByUserId(userId: string): Promise<Role[]>;

  /**
   * Create a new role
   */
  create(userId: string, roleName: string): Promise<Role>;

  /**
   * Delete a role
   */
  delete(roleId: string): Promise<void>;

  /**
   * Check if user has a specific role
   */
  hasRole(userId: string, roleName: string): Promise<boolean>;
}

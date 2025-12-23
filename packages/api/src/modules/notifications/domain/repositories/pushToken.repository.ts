/**
 * @file pushToken.repository.ts
 * @description Repository interface for push token management
 */

import { PushToken, DeviceType } from '../entities/pushToken.entity';

export interface PushTokenRepository {
  /**
   * Save or update a push token
   * Reactivates token if it already exists
   */
  saveToken(
    userId: string,
    token: string,
    deviceType: DeviceType,
    deviceId?: string
  ): Promise<PushToken>;

  /**
   * Deactivate a token (soft delete)
   */
  deactivateToken(token: string, userId: string): Promise<void>;

  /**
   * Get all active tokens for a user
   */
  getActiveTokensByUser(userId: string): Promise<PushToken[]>;

  /**
   * Find a specific token
   */
  findToken(userId: string, token: string): Promise<PushToken | null>;
}

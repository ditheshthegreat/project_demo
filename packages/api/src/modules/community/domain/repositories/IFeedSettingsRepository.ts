/**
 * @file IFeedSettingsRepository.ts
 * @module Community/Domain/Repositories
 * @layer Domain
 * @description Feed Settings Repository Interface (Port)
 * 
 * Defines the contract for feed settings persistence operations.
 */

import { FeedSettings } from '../value-objects/feedSettings.vo';

/**
 * Feed Settings Repository Interface
 * 
 * Contract for feed settings persistence operations.
 */
export interface IFeedSettingsRepository {
  /**
   * Get feed settings for a user
   * @param userId - User's UUID
   * @returns FeedSettings value object or null if not set
   */
  getByUserId(userId: string): Promise<FeedSettings | null>;
  
  /**
   * Update feed settings for a user
   * @param userId - User's UUID
   * @param settings - FeedSettings to save
   * @returns Updated FeedSettings
   */
  update(userId: string, settings: FeedSettings): Promise<FeedSettings>;
}

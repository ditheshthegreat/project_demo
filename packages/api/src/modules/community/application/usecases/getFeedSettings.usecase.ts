/**
 * @file getFeedSettings.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get Feed Settings Use Case
 */

import { FeedSettings } from '../../domain/value-objects/feedSettings.vo';
import { IFeedSettingsRepository } from '../../domain/repositories/IFeedSettingsRepository';

export class GetFeedSettingsUseCase {
  constructor(private readonly feedSettingsRepository: IFeedSettingsRepository) {}

  async execute(userId: string): Promise<FeedSettings> {
    const settings = await this.feedSettingsRepository.getByUserId(userId);
    
    // Return existing settings or default settings
    return settings || FeedSettings.createDefault();
  }
}

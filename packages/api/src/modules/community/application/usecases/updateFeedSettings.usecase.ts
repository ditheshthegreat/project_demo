/**
 * @file updateFeedSettings.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Update Feed Settings Use Case
 */

import { FeedSettings } from '../../domain/value-objects/feedSettings.vo';
import { IFeedSettingsRepository } from '../../domain/repositories/IFeedSettingsRepository';

export interface UpdateFeedSettingsDTO {
  userId: string;
  interests?: string[];
  accessibilityNeeds?: string[];
  distanceKm?: number;
  visibilityFilters?: {
    showPublicPosts: boolean;
    showFriendsPosts: boolean;
    showNearbyPosts: boolean;
  };
}

export class UpdateFeedSettingsUseCase {
  constructor(private readonly feedSettingsRepository: IFeedSettingsRepository) {}

  async execute(dto: UpdateFeedSettingsDTO): Promise<FeedSettings> {
    // Get existing settings or defaults
    const existingSettings = await this.feedSettingsRepository.getByUserId(dto.userId);
    const currentSettings = existingSettings || FeedSettings.createDefault();

    // Merge with updates
    const updatedSettings = FeedSettings.create({
      interests: dto.interests !== undefined ? dto.interests : currentSettings.interests,
      accessibilityNeeds: dto.accessibilityNeeds !== undefined ? dto.accessibilityNeeds : currentSettings.accessibilityNeeds,
      distanceKm: dto.distanceKm !== undefined ? dto.distanceKm : currentSettings.distanceKm,
      visibilityFilters: dto.visibilityFilters !== undefined ? dto.visibilityFilters : currentSettings.visibilityFilters,
    });

    return await this.feedSettingsRepository.update(dto.userId, updatedSettings);
  }
}

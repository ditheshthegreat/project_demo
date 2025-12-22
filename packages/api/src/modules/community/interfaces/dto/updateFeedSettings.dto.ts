/**
 * @file updateFeedSettings.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Update Feed Settings DTO with Zod Validation
 */

import { z } from 'zod';

export const UpdateFeedSettingsDtoSchema = z.object({
  interests: z.array(z.string()).optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
  distanceKm: z.number().min(1).max(500).optional(),
  visibilityFilters: z.object({
    showPublicPosts: z.boolean(),
    showFriendsPosts: z.boolean(),
    showNearbyPosts: z.boolean(),
  }).optional(),
});

export type UpdateFeedSettingsDto = z.infer<typeof UpdateFeedSettingsDtoSchema>;

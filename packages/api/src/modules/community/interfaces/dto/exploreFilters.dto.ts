/**
 * @file exploreFilters.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Explore Filters DTO with Zod Validation
 */

import { z } from 'zod';

export const ExploreFiltersDtoSchema = z.object({
  name: z.string().optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
  distanceKm: z.number().min(1).max(500).optional(),
  limit: z.number().min(1).max(50).optional(),
  offset: z.number().min(0).optional(),
});

export type ExploreFiltersDto = z.infer<typeof ExploreFiltersDtoSchema>;

/**
 * @file search.dto.ts
 * @module Chat/Interfaces/DTO
 * @layer Interface
 * @description Message Search DTOs with Zod validation
 */

import { z } from 'zod';

export const SearchMessagesDtoSchema = z.object({
  q: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query is too long')
    .trim(),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
  limit: z.coerce.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(50),
  offset: z.coerce.number()
    .int()
    .min(0)
    .optional()
    .default(0),
});

export type SearchMessagesDto = z.infer<typeof SearchMessagesDtoSchema>;

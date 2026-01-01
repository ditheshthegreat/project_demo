/**
 * @file reaction.dto.ts
 * @module Chat/Interfaces/DTO
 * @layer Interface
 * @description Message Reaction DTOs with Zod validation
 */

import { z } from 'zod';

export const AddReactionDtoSchema = z.object({
  emoji: z.string()
    .min(1, 'Emoji is required')
    .max(10, 'Emoji is too long')
    .trim(),
});

export type AddReactionDto = z.infer<typeof AddReactionDtoSchema>;

/**
 * @file createComment.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Create Comment DTO with Zod Validation
 */

import { z } from 'zod';

export const CreateCommentDtoSchema = z.object({
  content: z.string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment must not exceed 1000 characters'),
});

export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;

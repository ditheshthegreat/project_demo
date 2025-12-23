/**
 * @file updateComment.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Update Comment Data Transfer Object
 */

import { z } from 'zod';

export const UpdateCommentDtoSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment content is too long'),
});

export type UpdateCommentDTO = z.infer<typeof UpdateCommentDtoSchema>;

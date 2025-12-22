/**
 * @file createPost.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Create Post DTO with Zod Validation
 */

import { z } from 'zod';

export const CreatePostDtoSchema = z.object({
  feedType: z.enum(['photo', 'location', 'review'], {
    required_error: 'Feed type is required',
    invalid_type_error: 'Feed type must be photo, location, or review',
  }),
  visibility: z.enum(['public', 'friends', 'private'], {
    required_error: 'Visibility is required',
    invalid_type_error: 'Visibility must be public, friends, or private',
  }),
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content must not exceed 5000 characters'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional(),
});

export type CreatePostDto = z.infer<typeof CreatePostDtoSchema>;

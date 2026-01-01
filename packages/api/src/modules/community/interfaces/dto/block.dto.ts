/**
 * @file block.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Block User DTOs with Zod validation
 */

import { z } from 'zod';

export const BlockUserDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type BlockUserDto = z.infer<typeof BlockUserDtoSchema>;

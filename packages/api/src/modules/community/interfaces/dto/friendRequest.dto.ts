/**
 * @file friendRequest.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Friend Request DTOs with Zod Validation
 */

import { z } from 'zod';

export const SendFriendRequestDtoSchema = z.object({
  recipientId: z.string().uuid('Invalid user ID'),
});

export type SendFriendRequestDto = z.infer<typeof SendFriendRequestDtoSchema>;

export const HandleFriendRequestDtoSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
});

export type HandleFriendRequestDto = z.infer<typeof HandleFriendRequestDtoSchema>;

/**
 * @file message.dto.ts
 * @module Chat/Interfaces/DTO
 * @layer Interface
 * @description Message DTOs with Zod validation
 */

import { z } from 'zod';

export const MessageTypeSchema = z.enum(['TEXT', 'IMAGE', 'AUDIO']);

export const SendMessageDtoSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  content: z.string().min(1, 'Message content cannot be empty').max(10000, 'Message too long'),
  type: MessageTypeSchema.optional().default('TEXT'),
});

export const GetMessagesDtoSchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
});

export type SendMessageDto = z.infer<typeof SendMessageDtoSchema>;
export type GetMessagesDto = z.infer<typeof GetMessagesDtoSchema>;

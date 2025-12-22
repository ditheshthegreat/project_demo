/**
 * @file startConversation.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Start Conversation DTO with Zod Validation
 */

import { z } from 'zod';

export const StartConversationDtoSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
});

export type StartConversationDto = z.infer<typeof StartConversationDtoSchema>;

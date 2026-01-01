/**
 * @file notification.dto.ts
 * @module Notifications/Interfaces/DTO
 * @layer Interface
 * @description Notification DTOs with Zod validation
 */

import { z } from 'zod';

/**
 * Pagination DTO Schema
 * Validates query parameters for paginated notification list
 */
export const GetNotificationsDtoSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 1)
    .refine(val => val >= 1, {
      message: 'Page must be greater than or equal to 1',
    }),
  limit: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 20)
    .refine(val => val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
});

export type GetNotificationsDto = z.infer<typeof GetNotificationsDtoSchema>;

/**
 * Read Notification DTO Schema
 * Validates notification ID parameter
 */
export const ReadNotificationDtoSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid notification ID format',
  }),
});

export type ReadNotificationDto = z.infer<typeof ReadNotificationDtoSchema>;

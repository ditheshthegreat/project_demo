/**
 * @file report.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Report User DTOs with Zod validation
 */

import { z } from 'zod';

export const ReportUserDtoSchema = z.object({
  reason: z.string()
    .min(1, 'Reason is required')
    .max(200, 'Reason is too long'),
  description: z.string()
    .max(1000, 'Description is too long')
    .optional(),
});

export type ReportUserDto = z.infer<typeof ReportUserDtoSchema>;

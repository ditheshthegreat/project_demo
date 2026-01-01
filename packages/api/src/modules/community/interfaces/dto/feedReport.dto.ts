/**
 * @file feedReport.dto.ts
 * @module Community/Interfaces/DTO
 * @layer Interface
 * @description Feed Report DTOs with Zod validation
 */

import { z } from 'zod';

export const ReportFeedDtoSchema = z.object({
  reason: z.string()
    .min(1, 'Reason is required')
    .max(200, 'Reason is too long'),
  description: z.string()
    .max(1000, 'Description is too long')
    .optional(),
});

export type ReportFeedDto = z.infer<typeof ReportFeedDtoSchema>;

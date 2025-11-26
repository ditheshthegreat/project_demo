/**
 * @file step1.dto.ts
 * @description DTO for Step 1 - Basic Information
 */

import { z } from 'zod';

export const Step1Schema = z.object({
  gender: z.string().min(1, 'Gender is required'),
  dateOfBirth: z.string().datetime({ message: 'Invalid date format. Use ISO 8601 format' }),
  description: z.string().optional(),
});

export type Step1DTO = z.infer<typeof Step1Schema>;

export const validateStep1 = (data: unknown) => {
  return Step1Schema.parse(data);
};

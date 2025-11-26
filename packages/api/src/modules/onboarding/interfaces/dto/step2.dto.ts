/**
 * @file step2.dto.ts
 * @description DTO for Step 2 - Location Information
 */

import { z } from 'zod';

export const Step2Schema = z.object({
  city: z.string().min(1, 'City is required'),
  federalState: z.string().min(1, 'Federal state is required'),
  allowLocation: z.boolean(),
});

export type Step2DTO = z.infer<typeof Step2Schema>;

export const validateStep2 = (data: unknown) => {
  return Step2Schema.parse(data);
};

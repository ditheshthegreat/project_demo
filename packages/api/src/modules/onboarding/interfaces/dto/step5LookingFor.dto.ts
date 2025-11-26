/**
 * @file step5LookingFor.dto.ts
 * @description DTO for Step 5.3 - What Are You Looking For
 */

import { z } from 'zod';
import { ALLOWED_LOOKING_FOR } from '../../domain/constants/onboarding.constants';

export const Step5LookingForSchema = z.object({
  lookingFor: z
    .array(z.enum(ALLOWED_LOOKING_FOR as [string, ...string[]]))
    .min(1, 'Please select at least one option')
    .refine((items) => new Set(items).size === items.length, {
      message: 'Duplicate selections are not allowed',
    }),
});

export type Step5LookingForDTO = z.infer<typeof Step5LookingForSchema>;

export const validateStep5LookingFor = (data: unknown) => {
  return Step5LookingForSchema.parse(data);
};

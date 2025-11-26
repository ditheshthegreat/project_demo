/**
 * @file step3.dto.ts
 * @description DTO for Step 3 - Interests
 */

import { z } from 'zod';
import { ALLOWED_INTERESTS, MIN_INTERESTS } from '../../domain/constants/onboarding.constants';

export const Step3Schema = z.object({
  interests: z
    .array(z.enum(ALLOWED_INTERESTS as [string, ...string[]]))
    .min(MIN_INTERESTS, `Please select at least ${MIN_INTERESTS} interests`)
    .refine((items) => new Set(items).size === items.length, {
      message: 'Duplicate interests are not allowed',
    }),
});

export type Step3DTO = z.infer<typeof Step3Schema>;

export const validateStep3 = (data: unknown) => {
  return Step3Schema.parse(data);
};

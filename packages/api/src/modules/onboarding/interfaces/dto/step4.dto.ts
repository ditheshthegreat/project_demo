/**
 * @file step4.dto.ts
 * @description DTO for Step 4 - Hobbies
 */

import { z } from 'zod';
import { ALLOWED_HOBBIES } from '../../domain/constants/onboarding.constants';

export const Step4Schema = z.object({
  hobbies: z
    .array(z.enum(ALLOWED_HOBBIES as [string, ...string[]]))
    .min(1, 'Please select at least one hobby')
    .refine((items) => new Set(items).size === items.length, {
      message: 'Duplicate hobbies are not allowed',
    }),
});

export type Step4DTO = z.infer<typeof Step4Schema>;

export const validateStep4 = (data: unknown) => {
  return Step4Schema.parse(data);
};

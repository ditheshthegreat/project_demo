/**
 * @file step5Requirements.dto.ts
 * @description DTO for Step 5.1 - Accessibility Requirements
 */

import { z } from 'zod';
import { ALLOWED_ACCESSIBILITY_REQUIREMENTS } from '../../domain/constants/onboarding.constants';

export const Step5RequirementsSchema = z.object({
  accessibilityRequirements: z
    .array(z.enum(ALLOWED_ACCESSIBILITY_REQUIREMENTS as [string, ...string[]]))
    .refine((items) => new Set(items).size === items.length, {
      message: 'Duplicate requirements are not allowed',
    }),
});

export type Step5RequirementsDTO = z.infer<typeof Step5RequirementsSchema>;

export const validateStep5Requirements = (data: unknown) => {
  return Step5RequirementsSchema.parse(data);
};

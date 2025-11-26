/**
 * @file step5Communication.dto.ts
 * @description DTO for Step 5.4 - Preferred Communication
 */

import { z } from 'zod';
import { ALLOWED_COMMUNICATION_PREFERENCES } from '../../domain/constants/onboarding.constants';

export const Step5CommunicationSchema = z.object({
  communicationPreferences: z
    .array(z.enum(ALLOWED_COMMUNICATION_PREFERENCES as [string, ...string[]]))
    .min(1, 'Please select at least one communication preference')
    .refine((items) => new Set(items).size === items.length, {
      message: 'Duplicate preferences are not allowed',
    }),
});

export type Step5CommunicationDTO = z.infer<typeof Step5CommunicationSchema>;

export const validateStep5Communication = (data: unknown) => {
  return Step5CommunicationSchema.parse(data);
};

/**
 * @file step6.dto.ts
 * @description DTO for Step 6 - Privacy Settings
 */

import { z } from 'zod';

export const Step6Schema = z.object({
  allowLocation: z.boolean(),
  showAge: z.boolean(),
  allowMatching: z.boolean(),
  publicProfile: z.boolean(),
  allowNotifications: z.boolean(),
});

export type Step6DTO = z.infer<typeof Step6Schema>;

export const validateStep6 = (data: unknown) => {
  return Step6Schema.parse(data);
};

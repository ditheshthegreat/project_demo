/**
 * @file step5Tools.dto.ts
 * @description DTO for Step 5.2 - Accessibility Tools
 */

import { z } from 'zod';
import { ALLOWED_ACCESSIBILITY_TOOLS } from '../../domain/constants/onboarding.constants';

export const Step5ToolsSchema = z.object({
  accessibilityTools: z
    .array(z.enum(ALLOWED_ACCESSIBILITY_TOOLS as [string, ...string[]]))
    .refine((items) => new Set(items).size === items.length, {
      message: 'Duplicate tools are not allowed',
    }),
});

export type Step5ToolsDTO = z.infer<typeof Step5ToolsSchema>;

export const validateStep5Tools = (data: unknown) => {
  return Step5ToolsSchema.parse(data);
};

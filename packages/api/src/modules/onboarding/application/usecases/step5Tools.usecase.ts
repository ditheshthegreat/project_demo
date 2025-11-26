/**
 * @file step5Tools.usecase.ts
 * @description Use case for Step 5.2 - Accessibility Tools
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step5ToolsInput {
  userId: string;
  accessibilityTools: string[];
}

export class Step5ToolsUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: Step5ToolsInput): Promise<void> {
    await this.onboardingRepository.updateAccessibilityTools(
      input.userId,
      input.accessibilityTools
    );
  }
}

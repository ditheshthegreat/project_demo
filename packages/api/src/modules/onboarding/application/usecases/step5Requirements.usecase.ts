/**
 * @file step5Requirements.usecase.ts
 * @description Use case for Step 5.1 - Accessibility Requirements
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step5RequirementsInput {
  userId: string;
  accessibilityRequirements: string[];
}

export class Step5RequirementsUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: Step5RequirementsInput): Promise<void> {
    await this.onboardingRepository.updateAccessibilityRequirements(
      input.userId,
      input.accessibilityRequirements
    );
  }
}

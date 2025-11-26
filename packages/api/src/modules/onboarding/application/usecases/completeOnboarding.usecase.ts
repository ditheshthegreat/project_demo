/**
 * @file completeOnboarding.usecase.ts
 * @description Use case for completing onboarding
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface CompleteOnboardingInput {
  userId: string;
}

export class CompleteOnboardingUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: CompleteOnboardingInput): Promise<void> {
    await this.onboardingRepository.completeOnboarding(input.userId);
  }
}

/**
 * @file step5LookingFor.usecase.ts
 * @description Use case for Step 5.3 - What Are You Looking For
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step5LookingForInput {
  userId: string;
  lookingFor: string[];
}

export class Step5LookingForUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: Step5LookingForInput): Promise<void> {
    await this.onboardingRepository.updateLookingFor(input.userId, input.lookingFor);
  }
}

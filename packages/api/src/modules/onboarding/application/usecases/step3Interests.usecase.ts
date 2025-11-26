/**
 * @file step3Interests.usecase.ts
 * @description Use case for Step 3 - Interests
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step3Input {
  userId: string;
  interests: string[];
}

export class Step3InterestsUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: Step3Input): Promise<void> {
    await this.onboardingRepository.updateInterests(input.userId, input.interests);
  }
}

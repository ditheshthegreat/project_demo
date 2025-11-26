/**
 * @file step4Hobbies.usecase.ts
 * @description Use case for Step 4 - Hobbies
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step4Input {
  userId: string;
  hobbies: string[];
}

export class Step4HobbiesUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: Step4Input): Promise<void> {
    await this.onboardingRepository.updateHobbies(input.userId, input.hobbies);
  }
}

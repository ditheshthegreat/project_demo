/**
 * @file step2Location.usecase.ts
 * @description Use case for Step 2 - Location Information
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step2Input {
  userId: string;
  city: string;
  federalState: string;
  allowLocation: boolean;
}

export class Step2LocationUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}

  async execute(input: Step2Input): Promise<void> {
    await this.onboardingRepository.updateLocation(input.userId, {
      city: input.city,
      federalState: input.federalState,
      allowLocation: input.allowLocation,
    });
  }
}

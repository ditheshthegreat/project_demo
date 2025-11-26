/**
 * @file step6Privacy.usecase.ts
 * @description Use case for Step 6 - Privacy Settings
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step6Input {
  userId: string;
  allowLocation: boolean;
  showAge: boolean;
  allowMatching: boolean;
  publicProfile: boolean;
  allowNotifications: boolean;
}

export class Step6PrivacyUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: Step6Input): Promise<void> {
    await this.onboardingRepository.updatePrivacySettings(input.userId, {
      allowLocation: input.allowLocation,
      showAge: input.showAge,
      allowMatching: input.allowMatching,
      publicProfile: input.publicProfile,
      allowNotifications: input.allowNotifications,
    });
  }
}

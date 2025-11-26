/**
 * @file step5Communication.usecase.ts
 * @description Use case for Step 5.4 - Communication Preferences
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step5CommunicationInput {
  userId: string;
  communicationPreferences: string[];
}

export class Step5CommunicationUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: Step5CommunicationInput): Promise<void> {
    await this.onboardingRepository.updateCommunicationPreferences(
      input.userId,
      input.communicationPreferences
    );
  }
}

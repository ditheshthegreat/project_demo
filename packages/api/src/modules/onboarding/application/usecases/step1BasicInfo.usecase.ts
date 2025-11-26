/**
 * @file step1BasicInfo.usecase.ts
 * @description Use case for Step 1 - Basic Information
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';

export interface Step1Input {
  userId: string;
  gender: string;
  dateOfBirth: Date;
  description?: string;
}

export class Step1BasicInfoUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}

  async execute(input: Step1Input): Promise<void> {
    await this.onboardingRepository.updateBasicInfo(input.userId, {
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      description: input.description,
    });
  }
}

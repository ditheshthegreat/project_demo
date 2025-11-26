/**
 * @file getOnboardingStatus.usecase.ts
 * @description Use case for getting onboarding status
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';
import { OnboardingStatus } from '../../domain/entities/onboardingData.entity';

export interface GetOnboardingStatusInput {
  userId: string;
}

export class GetOnboardingStatusUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  
  async execute(input: GetOnboardingStatusInput): Promise<OnboardingStatus> {
    return await this.onboardingRepository.getStatus(input.userId);
  }
}

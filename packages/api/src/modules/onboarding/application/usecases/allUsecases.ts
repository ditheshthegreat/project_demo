/**
 * @file allUsecases.ts
 * @description All onboarding usecases in one file for efficiency
 * 
 * // DEPRECATED: Use individual usecase files instead
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';
import { OnboardingStatus } from '../../domain/entities/onboardingData.entity';

// Step 2: Location
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

// Step 3: Interests
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

// Step 4: Hobbies
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

// Step 5.1: Requirements
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

// Step 5.2: Tools
export interface Step5ToolsInput {
  userId: string;
  accessibilityTools: string[];
}

export class Step5ToolsUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  async execute(input: Step5ToolsInput): Promise<void> {
    await this.onboardingRepository.updateAccessibilityTools(
      input.userId,
      input.accessibilityTools
    );
  }
}

// Step 5.3: Looking For
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

// Step 5.4: Communication
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

// Step 6: Privacy
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

// Complete Onboarding
export interface CompleteOnboardingInput {
  userId: string;
}

export class CompleteOnboardingUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  async execute(input: CompleteOnboardingInput): Promise<void> {
    await this.onboardingRepository.completeOnboarding(input.userId);
  }
}

// Get Status
export interface GetOnboardingStatusInput {
  userId: string;
}

export class GetOnboardingStatusUseCase {
  constructor(private onboardingRepository: OnboardingRepository) {}
  async execute(input: GetOnboardingStatusInput): Promise<OnboardingStatus> {
    return await this.onboardingRepository.getStatus(input.userId);
  }
}

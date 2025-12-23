/**
 * @file onboarding.repository.ts
 * @description Repository interface for onboarding operations
 */

import { OnboardingData, OnboardingStatus } from '../entities/onboardingData.entity';

export interface OnboardingRepository {
  /**
   * Update basic information (Step 1)
   */
  updateBasicInfo(
    userId: string,
    data: {
      gender: string;
      dateOfBirth: Date;
      description?: string;
    }
  ): Promise<void>;

  /**
   * Update location information (Step 2)
   */
  updateLocation(
    userId: string,
    data: {
      city: string;
      federalState: string;
      allowLocation: boolean;
      latitude?: number | null;
      longitude?: number | null;
    }
  ): Promise<void>;

  /**
   * Update interests (Step 3)
   */
  updateInterests(userId: string, interests: string[]): Promise<void>;

  /**
   * Update hobbies (Step 4)
   */
  updateHobbies(userId: string, hobbies: string[]): Promise<void>;

  /**
   * Update accessibility requirements (Step 5.1)
   */
  updateAccessibilityRequirements(
    userId: string,
    requirements: string[]
  ): Promise<void>;

  /**
   * Update accessibility tools (Step 5.2)
   */
  updateAccessibilityTools(userId: string, tools: string[]): Promise<void>;

  /**
   * Update looking for (Step 5.3)
   */
  updateLookingFor(userId: string, lookingFor: string[]): Promise<void>;

  /**
   * Update communication preferences (Step 5.4)
   */
  updateCommunicationPreferences(
    userId: string,
    preferences: string[]
  ): Promise<void>;

  /**
   * Update privacy settings (Step 6)
   */
  updatePrivacySettings(
    userId: string,
    data: {
      allowLocation: boolean;
      showAge: boolean;
      allowMatching: boolean;
      publicProfile: boolean;
      allowNotifications: boolean;
    }
  ): Promise<void>;

  /**
   * Complete onboarding process
   */
  completeOnboarding(userId: string): Promise<void>;

  /**
   * Get onboarding status
   */
  getStatus(userId: string): Promise<OnboardingStatus>;

  /**
   * Update onboarding step
   */
  updateOnboardingStep(userId: string, step: number): Promise<void>;
}

/**
 * @file onboardingData.entity.ts
 * @description Domain entity for onboarding data
 */

export interface OnboardingData {
  userId: string;
  onboardingStep: number;
  onboardingCompleted: boolean;
  
  // Step 1: Basic Information
  gender?: string;
  dateOfBirth?: Date;
  description?: string;
  
  // Step 2: Location
  city?: string;
  federalState?: string;
  latitude?: number;
  longitude?: number;
  allowLocation: boolean;
  
  // Step 3: Interests
  interests: string[];
  
  // Step 4: Hobbies
  hobbies: string[];
  
  // Step 5: Accessibility & Support
  accessibilityRequirements: string[];
  accessibilityTools: string[];
  lookingFor: string[];
  communicationPreferences: string[];
  
  // Step 6: Privacy Settings
  showAge: boolean;
  allowMatching: boolean;
  publicProfile: boolean;
  allowNotifications: boolean;
}

export interface OnboardingStatus {
  currentStep: number;
  completed: boolean;
  totalSteps: number;
  completedSteps: number[];
  data: Partial<OnboardingData>;
}

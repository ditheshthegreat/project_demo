/**
 * @file onboarding.repository.impl.ts
 * @description Prisma implementation of onboarding repository
 */

import { PrismaClient } from '@prisma/client';
import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';
import { OnboardingStatus } from '../../domain/entities/onboardingData.entity';
import { TOTAL_ONBOARDING_STEPS } from '../../domain/constants/onboarding.constants';
import { NotFoundException } from '../../../../shared/core/exceptions/AppException';

export class OnboardingRepositoryImpl implements OnboardingRepository {
  constructor(private prisma: PrismaClient) {}

  async updateBasicInfo(
    userId: string,
    data: {
      gender: string;
      dateOfBirth: Date;
      description?: string;
    }
  ): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        description: data.description,
        onboardingStep: Math.max(1, (await this.getCurrentStep(userId)) || 0),
      },
    });
  }

  async updateLocation(
    userId: string,
    data: {
      city: string;
      federalState: string;
      allowLocation: boolean;
      latitude?: number | null;
      longitude?: number | null;
    }
  ): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        city: data.city,
        federalState: data.federalState,
        allowLocation: data.allowLocation,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        onboardingStep: Math.max(2, (await this.getCurrentStep(userId)) || 0),
      },
    });
  }

  async updateInterests(userId: string, interests: string[]): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        interests,
        onboardingStep: Math.max(3, (await this.getCurrentStep(userId)) || 0),
      },
    });
  }

  async updateHobbies(userId: string, hobbies: string[]): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        hobbies,
        onboardingStep: Math.max(4, (await this.getCurrentStep(userId)) || 0),
      },
    });
  }

  async updateAccessibilityRequirements(
    userId: string,
    requirements: string[]
  ): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        accessibilityRequirements: requirements,
      },
    });
  }

  async updateAccessibilityTools(
    userId: string,
    tools: string[]
  ): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        accessibilityTools: tools,
      },
    });
  }

  async updateLookingFor(userId: string, lookingFor: string[]): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        lookingFor,
      },
    });
  }

  async updateCommunicationPreferences(
    userId: string,
    preferences: string[]
  ): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        communicationPreferences: preferences,
        onboardingStep: Math.max(5, (await this.getCurrentStep(userId)) || 0),
      },
    });
  }

  async updatePrivacySettings(
    userId: string,
    data: {
      allowLocation: boolean;
      showAge: boolean;
      allowMatching: boolean;
      publicProfile: boolean;
      allowNotifications: boolean;
    }
  ): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        allowLocation: data.allowLocation,
        showAge: data.showAge,
        allowMatching: data.allowMatching,
        publicProfile: data.publicProfile,
        allowNotifications: data.allowNotifications,
        onboardingStep: Math.max(6, (await this.getCurrentStep(userId)) || 0),
      },
    });
  }

  async completeOnboarding(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        onboardingCompleted: true,
        onboardingStep: TOTAL_ONBOARDING_STEPS,
      },
    });
  }

  async getStatus(userId: string): Promise<OnboardingStatus> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: userId },
      select: {
        onboardingStep: true,
        onboardingCompleted: true,
        gender: true,
        dateOfBirth: true,
        description: true,
        city: true,
        federalState: true,
        latitude: true,
        longitude: true,
        allowLocation: true,
        interests: true,
        hobbies: true,
        accessibilityRequirements: true,
        accessibilityTools: true,
        lookingFor: true,
        communicationPreferences: true,
        showAge: true,
        allowMatching: true,
        publicProfile: true,
        allowNotifications: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    const completedSteps: number[] = [];
    if (user.gender && user.dateOfBirth) completedSteps.push(1);
    if (user.city && user.federalState) completedSteps.push(2);
    if (user.interests && user.interests.length >= 3) completedSteps.push(3);
    if (user.hobbies && user.hobbies.length > 0) completedSteps.push(4);
    if (
      user.accessibilityRequirements &&
      user.accessibilityTools &&
      user.lookingFor &&
      user.communicationPreferences &&
      user.lookingFor.length > 0 &&
      user.communicationPreferences.length > 0
    ) {
      completedSteps.push(5);
    }
    // Step 6 is always considered complete if privacy settings exist
    completedSteps.push(6);

    return {
      currentStep: user.onboardingStep,
      completed: user.onboardingCompleted,
      totalSteps: TOTAL_ONBOARDING_STEPS,
      completedSteps,
      data: {
        userId,
        onboardingStep: user.onboardingStep,
        onboardingCompleted: user.onboardingCompleted,
        gender: user.gender || undefined,
        dateOfBirth: user.dateOfBirth || undefined,
        description: user.description || undefined,
        city: user.city || undefined,
        federalState: user.federalState || undefined,
        latitude: user.latitude ?? undefined,
        longitude: user.longitude ?? undefined,
        allowLocation: user.allowLocation,
        interests: user.interests || [],
        hobbies: user.hobbies || [],
        accessibilityRequirements: user.accessibilityRequirements || [],
        accessibilityTools: user.accessibilityTools || [],
        lookingFor: user.lookingFor || [],
        communicationPreferences: user.communicationPreferences || [],
        showAge: user.showAge,
        allowMatching: user.allowMatching,
        publicProfile: user.publicProfile,
        allowNotifications: user.allowNotifications,
      },
    };
  }

  async updateOnboardingStep(userId: string, step: number): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        onboardingStep: step,
      },
    });
  }

  private async getCurrentStep(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: userId },
      select: { onboardingStep: true },
    });
    return user?.onboardingStep || 0;
  }
}

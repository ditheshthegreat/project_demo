/**
 * @file userProfileRepository.impl.ts
 * @module Community/Infrastructure/Database
 * @layer Infrastructure
 * @description User Profile Repository Implementation using Prisma
 */

import { IUserProfileRepository, UserProfile, ExploreFilters } from '../../domain/repositories/IUserProfileRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { Prisma } from '@prisma/client';

export class UserProfileRepositoryImpl implements IUserProfileRepository {
  async explore(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    const limit = Math.min(filters.limit || 20, 50);
    const offset = filters.offset || 0;

    const where: Prisma.UserWhereInput = {
      firebaseUid: { not: currentUserId },
      isDeleted: false,
      onboardingCompleted: true,
      publicProfile: true,
    };

    // Apply filters
    if (filters.interests && filters.interests.length > 0) {
      where.interests = { hasSome: filters.interests };
    }

    if (filters.skills && filters.skills.length > 0) {
      where.hobbies = { hasSome: filters.skills };
    }

    if (filters.accessibilityNeeds && filters.accessibilityNeeds.length > 0) {
      where.accessibilityRequirements = { hasSome: filters.accessibilityNeeds };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
        profileImage: true,
        gender: true,
        city: true,
        federalState: true,
        interests: true,
        hobbies: true,
        accessibilityRequirements: true,
        description: true,
        onboardingCompleted: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.mapToUserProfile(user));
  }

  async search(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    const limit = Math.min(filters.limit || 20, 50);
    const offset = filters.offset || 0;

    const where: Prisma.UserWhereInput = {
      firebaseUid: { not: currentUserId },
      isDeleted: false,
      onboardingCompleted: true,
      publicProfile: true,
    };

    // Name search (case-insensitive)
    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    // Apply other filters
    if (filters.interests && filters.interests.length > 0) {
      where.interests = { hasSome: filters.interests };
    }

    if (filters.skills && filters.skills.length > 0) {
      where.hobbies = { hasSome: filters.skills };
    }

    if (filters.accessibilityNeeds && filters.accessibilityNeeds.length > 0) {
      where.accessibilityRequirements = { hasSome: filters.accessibilityNeeds };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
        profileImage: true,
        gender: true,
        city: true,
        federalState: true,
        interests: true,
        hobbies: true,
        accessibilityRequirements: true,
        description: true,
        onboardingCompleted: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.mapToUserProfile(user));
  }

  async nearby(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    const limit = Math.min(filters.limit || 20, 50);
    const offset = filters.offset || 0;

    // Get current user's location
    const currentUser = await prisma.user.findUnique({
      where: { firebaseUid: currentUserId },
      select: { city: true, federalState: true },
    });

    if (!currentUser || !currentUser.city) {
      return [];
    }

    const where: Prisma.UserWhereInput = {
      firebaseUid: { not: currentUserId },
      isDeleted: false,
      onboardingCompleted: true,
      publicProfile: true,
      allowLocation: true,
      city: currentUser.city, // Same city for nearby (simplified)
    };

    // Apply other filters
    if (filters.interests && filters.interests.length > 0) {
      where.interests = { hasSome: filters.interests };
    }

    if (filters.skills && filters.skills.length > 0) {
      where.hobbies = { hasSome: filters.skills };
    }

    if (filters.accessibilityNeeds && filters.accessibilityNeeds.length > 0) {
      where.accessibilityRequirements = { hasSome: filters.accessibilityNeeds };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
        profileImage: true,
        gender: true,
        city: true,
        federalState: true,
        interests: true,
        hobbies: true,
        accessibilityRequirements: true,
        description: true,
        onboardingCompleted: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.mapToUserProfile(user));
  }

  private mapToUserProfile(user: any): UserProfile {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      gender: user.gender,
      city: user.city,
      federalState: user.federalState,
      interests: user.interests,
      hobbies: user.hobbies,
      accessibilityRequirements: user.accessibilityRequirements,
      description: user.description,
      onboardingCompleted: user.onboardingCompleted,
    };
  }
}

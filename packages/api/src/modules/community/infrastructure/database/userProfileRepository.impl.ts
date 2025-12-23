/**
 * @file userProfileRepository.impl.ts
 * @module Community/Infrastructure/Database
 * @layer Infrastructure
 * @description User Profile Repository Implementation using Prisma
 */

import { IUserProfileRepository, UserProfile, ExploreFilters } from '../../domain/repositories/IUserProfileRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { Prisma } from '@prisma/client';
import { safeCalculateDistance } from '../../../../shared/utils/distance.util';

export class UserProfileRepositoryImpl implements IUserProfileRepository {
  private caseInsensitiveArrayMatch(dbArray: string[] | null, filterValues: string[]): boolean {
    if (!dbArray || dbArray.length === 0) return false;
    const lowerDbArray = dbArray.map(v => v.toLowerCase());
    const lowerFilterValues = filterValues.map(v => v.toLowerCase());
    return lowerFilterValues.some(filterVal => lowerDbArray.includes(filterVal));
  }

  async explore(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    const limit = Math.min(filters.limit || 20, 50);
    const offset = filters.offset || 0;

    // Get current user's location for distance calculation
    const currentUser = await prisma.user.findUnique({
      where: { firebaseUid: currentUserId },
      select: { latitude: true, longitude: true },
    });

    const baseWhere: Prisma.UserWhereInput = {
      firebaseUid: { not: currentUserId },
      isDeleted: false,
      onboardingCompleted: true,
      publicProfile: true,
    };

    // Fetch all eligible users first
    const users = await prisma.user.findMany({
      where: baseWhere,
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
        profileImage: true,
        gender: true,
        city: true,
        federalState: true,
        latitude: true,
        longitude: true,
        interests: true,
        hobbies: true,
        accessibilityRequirements: true,
        description: true,
        onboardingCompleted: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate distance for each user
    const usersWithDistance = users.map(user => ({
      ...user,
      distanceKm: safeCalculateDistance(
        currentUser?.latitude,
        currentUser?.longitude,
        user.latitude,
        user.longitude
      ),
    }));

    // Apply case-insensitive filtering
    let filteredUsers = usersWithDistance;

    if (filters.interests || filters.skills || filters.accessibilityNeeds) {
      filteredUsers = usersWithDistance.filter(user => {
        const hasInterests = filters.interests && filters.interests.length > 0
          ? this.caseInsensitiveArrayMatch(user.interests, filters.interests)
          : false;

        const hasSkills = filters.skills && filters.skills.length > 0
          ? this.caseInsensitiveArrayMatch(user.hobbies, filters.skills)
          : false;

        const hasAccessibility = filters.accessibilityNeeds && filters.accessibilityNeeds.length > 0
          ? this.caseInsensitiveArrayMatch(user.accessibilityRequirements, filters.accessibilityNeeds)
          : false;

        // OR logic - match if ANY filter category matches
        return hasInterests || hasSkills || hasAccessibility;
      });
    }

    // Apply distance filter if provided and applicable
    if (filters.distanceKm != null) {
      filteredUsers = filteredUsers.filter(user => {
        // Only filter if distance can be calculated
        if (user.distanceKm == null) return true; // Don't exclude users without coordinates
        return user.distanceKm <= filters.distanceKm!;
      });
    }

    // Sort by distance if available
    filteredUsers.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    // Apply pagination after filtering
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return paginatedUsers.map(user => this.mapToUserProfile(user));
  }

  async search(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    const limit = Math.min(filters.limit || 20, 50);
    const offset = filters.offset || 0;

    // Get current user's location for distance calculation
    const currentUser = await prisma.user.findUnique({
      where: { firebaseUid: currentUserId },
      select: { latitude: true, longitude: true },
    });

    const baseWhere: Prisma.UserWhereInput = {
      firebaseUid: { not: currentUserId },
      isDeleted: false,
      onboardingCompleted: true,
      publicProfile: true,
    };

    // Name search (case-insensitive)
    if (filters.name) {
      baseWhere.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    // Fetch all eligible users first
    const users = await prisma.user.findMany({
      where: baseWhere,
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
        profileImage: true,
        gender: true,
        city: true,
        federalState: true,
        latitude: true,
        longitude: true,
        interests: true,
        hobbies: true,
        accessibilityRequirements: true,
        description: true,
        onboardingCompleted: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate distance for each user
    const usersWithDistance = users.map(user => ({
      ...user,
      distanceKm: safeCalculateDistance(
        currentUser?.latitude,
        currentUser?.longitude,
        user.latitude,
        user.longitude
      ),
    }));

    // Apply case-insensitive filtering
    let filteredUsers = usersWithDistance;

    if (filters.interests || filters.skills || filters.accessibilityNeeds) {
      filteredUsers = usersWithDistance.filter(user => {
        const hasInterests = filters.interests && filters.interests.length > 0
          ? this.caseInsensitiveArrayMatch(user.interests, filters.interests)
          : false;

        const hasSkills = filters.skills && filters.skills.length > 0
          ? this.caseInsensitiveArrayMatch(user.hobbies, filters.skills)
          : false;

        const hasAccessibility = filters.accessibilityNeeds && filters.accessibilityNeeds.length > 0
          ? this.caseInsensitiveArrayMatch(user.accessibilityRequirements, filters.accessibilityNeeds)
          : false;

        // OR logic - match if ANY filter category matches
        return hasInterests || hasSkills || hasAccessibility;
      });
    }

    // Apply distance filter if provided and applicable
    if (filters.distanceKm != null) {
      filteredUsers = filteredUsers.filter(user => {
        // Only filter if distance can be calculated
        if (user.distanceKm == null) return true; // Don't exclude users without coordinates
        return user.distanceKm <= filters.distanceKm!;
      });
    }

    // Sort by distance if available
    filteredUsers.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    // Apply pagination after filtering
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return paginatedUsers.map(user => this.mapToUserProfile(user));
  }

  async nearby(currentUserId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    const limit = Math.min(filters.limit || 20, 50);
    const offset = filters.offset || 0;
    const defaultDistanceKm = filters.distanceKm || 50; // Default 50km radius for nearby

    // Get current user's location
    const currentUser = await prisma.user.findUnique({
      where: { firebaseUid: currentUserId },
      select: { latitude: true, longitude: true, city: true, federalState: true },
    });

    const baseWhere: Prisma.UserWhereInput = {
      firebaseUid: { not: currentUserId },
      isDeleted: false,
      onboardingCompleted: true,
      publicProfile: true,
      allowLocation: true,
    };

    // Fetch all eligible users with location permission
    const users = await prisma.user.findMany({
      where: baseWhere,
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
        profileImage: true,
        gender: true,
        city: true,
        federalState: true,
        latitude: true,
        longitude: true,
        interests: true,
        hobbies: true,
        accessibilityRequirements: true,
        description: true,
        onboardingCompleted: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate distance for each user
    const usersWithDistance = users.map(user => ({
      ...user,
      distanceKm: safeCalculateDistance(
        currentUser?.latitude,
        currentUser?.longitude,
        user.latitude,
        user.longitude
      ),
    }));

    // Filter by distance (only if both users have coordinates)
    let filteredUsers = usersWithDistance.filter(user => {
      if (user.distanceKm == null) return false; // Exclude users without calculable distance
      return user.distanceKm <= defaultDistanceKm;
    });

    // Apply case-insensitive filtering
    if (filters.interests || filters.skills || filters.accessibilityNeeds) {
      filteredUsers = filteredUsers.filter(user => {
        const hasInterests = filters.interests && filters.interests.length > 0
          ? this.caseInsensitiveArrayMatch(user.interests, filters.interests)
          : false;

        const hasSkills = filters.skills && filters.skills.length > 0
          ? this.caseInsensitiveArrayMatch(user.hobbies, filters.skills)
          : false;

        const hasAccessibility = filters.accessibilityNeeds && filters.accessibilityNeeds.length > 0
          ? this.caseInsensitiveArrayMatch(user.accessibilityRequirements, filters.accessibilityNeeds)
          : false;

        // OR logic - match if ANY filter category matches
        return hasInterests || hasSkills || hasAccessibility;
      });
    }

    // Sort by distance (closest first)
    filteredUsers.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    // Apply pagination after filtering
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return paginatedUsers.map(user => this.mapToUserProfile(user));
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
      distanceKm: user.distanceKm ?? null,
    };
  }
}

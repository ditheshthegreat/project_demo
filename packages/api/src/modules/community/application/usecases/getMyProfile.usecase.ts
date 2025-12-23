/**
 * @file getMyProfile.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get My Profile Use Case
 */

import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { NotFoundException } from '../../../../shared/core/exceptions/AppException';
import { UserProfileData } from './getUserProfile.usecase';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class GetMyProfileUseCase {
  constructor(
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly postRepository: IPostRepository,
    private readonly friendRepository: IFriendRepository
  ) {}

  async execute(userId: string): Promise<UserProfileData> {
    // Get user profile directly (userId is the database user ID)
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user || !user.onboardingCompleted) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Get posts count
    const userPosts = await this.postRepository.findByUserId(userId);
    const postsCount = userPosts.length;

    // Get friends count
    const friends = await this.friendRepository.findFriendsByUserId(userId);
    const friendsCount = friends.length;

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      gender: user.gender,
      city: user.city,
      federalState: user.federalState,
      description: user.description,
      interests: user.interests,
      hobbies: user.hobbies,
      accessibilityRequirements: user.accessibilityRequirements,
      postsCount,
      friendsCount,
      mutualFriendsCount: 0, // Not applicable for own profile
      isFriend: false, // Not applicable for own profile
      hasPendingRequest: false, // Not applicable for own profile
    };
  }
}

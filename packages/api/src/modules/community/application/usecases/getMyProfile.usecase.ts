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

export class GetMyProfileUseCase {
  constructor(
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly postRepository: IPostRepository,
    private readonly friendRepository: IFriendRepository
  ) {}

  async execute(userId: string): Promise<UserProfileData> {
    // Get user profile
    const users = await this.userProfileRepository.explore(userId, {});
    const user = users.find(u => u.firebaseUid === userId);

    if (!user) {
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

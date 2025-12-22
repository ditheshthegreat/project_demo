/**
 * @file getUserProfile.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get User Profile Use Case
 */

import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { IFriendRepository } from '../../domain/repositories/IFriendRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';

export interface UserProfileData {
  id: string;
  firebaseUid: string;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  gender: string | null;
  city: string | null;
  federalState: string | null;
  description: string | null;
  interests: string[];
  hobbies: string[];
  accessibilityRequirements: string[];
  postsCount: number;
  friendsCount: number;
  mutualFriendsCount: number;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

export class GetUserProfileUseCase {
  constructor(
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly postRepository: IPostRepository,
    private readonly friendRepository: IFriendRepository
  ) {}

  async execute(userId: string, currentUserId: string): Promise<UserProfileData> {
    // Get user profile
    const users = await this.userProfileRepository.explore(currentUserId, {});
    const user = users.find(u => u.firebaseUid === userId);

    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Check privacy settings
    if (!user.onboardingCompleted) {
      throw new ForbiddenException('Profile not available', 'PROFILE_NOT_AVAILABLE');
    }

    // Get posts count
    const userPosts = await this.postRepository.findByUserId(userId);
    const postsCount = userPosts.length;

    // Get friends count
    const friends = await this.friendRepository.findFriendsByUserId(userId);
    const friendsCount = friends.length;

    // Get mutual friends count
    const currentUserFriends = await this.friendRepository.findFriendsByUserId(currentUserId);
    const mutualFriendsCount = this.calculateMutualFriends(friends, currentUserFriends);

    // Check friendship status
    const relationship = await this.friendRepository.findByUsers(currentUserId, userId);
    const isFriend = relationship !== null && relationship.status === 'accepted';
    const hasPendingRequest = relationship !== null && relationship.status === 'pending';

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
      mutualFriendsCount,
      isFriend,
      hasPendingRequest,
    };
  }

  private calculateMutualFriends(userFriends: any[], currentUserFriends: any[]): number {
    const userFriendIds = new Set(
      userFriends.flatMap(f => [f.userId, f.friendId])
    );
    const currentUserFriendIds = new Set(
      currentUserFriends.flatMap(f => [f.userId, f.friendId])
    );

    let mutualCount = 0;
    for (const id of userFriendIds) {
      if (currentUserFriendIds.has(id)) {
        mutualCount++;
      }
    }

    return mutualCount;
  }
}

/**
 * @file nearbyUsers.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Nearby Users Use Case
 */

import { IUserProfileRepository, UserProfile, ExploreFilters } from '../../domain/repositories/IUserProfileRepository';

export class NearbyUsersUseCase {
  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    return await this.userProfileRepository.nearby(userId, filters);
  }
}

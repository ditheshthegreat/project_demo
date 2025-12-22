/**
 * @file exploreUsers.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Explore Users Use Case
 */

import { IUserProfileRepository, UserProfile, ExploreFilters } from '../../domain/repositories/IUserProfileRepository';

export class ExploreUsersUseCase {
  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    return await this.userProfileRepository.explore(userId, filters);
  }
}

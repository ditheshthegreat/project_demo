/**
 * @file searchUsers.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Search Users Use Case
 */

import { IUserProfileRepository, UserProfile, ExploreFilters } from '../../domain/repositories/IUserProfileRepository';

export class SearchUsersUseCase {
  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string, filters: ExploreFilters): Promise<UserProfile[]> {
    return await this.userProfileRepository.search(userId, filters);
  }
}

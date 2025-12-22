/**
 * @file getFeed.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get Feed Use Case
 */

import { FeedPost } from '../../domain/entities/feedPost.entity';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { FEED_CONSTANTS } from '../../domain/constants/feed.constants';

export interface GetFeedDTO {
  userId: string;
  limit?: number;
  offset?: number;
}

export class GetFeedUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(dto: GetFeedDTO): Promise<FeedPost[]> {
    const limit = Math.min(dto.limit || FEED_CONSTANTS.DEFAULT_PAGE_SIZE, FEED_CONSTANTS.MAX_PAGE_SIZE);
    const offset = dto.offset || 0;

    return await this.postRepository.findFeedPosts(dto.userId, limit, offset);
  }
}

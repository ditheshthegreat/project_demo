/**
 * @file getPostById.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get Post By ID Use Case
 */

import { FeedPost } from '../../domain/entities/feedPost.entity';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { NotFoundException } from '../../../../shared/core/exceptions/AppException';

export class GetPostByIdUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(postId: string, userId: string): Promise<FeedPost> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
    }

    // Check visibility permissions
    if (post.visibility === 'private' && post.userId !== userId) {
      throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
    }

    // For friends-only posts, we'd check friendship here (MVP: treat as not found)
    if (post.visibility === 'friends' && post.userId !== userId) {
      throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
    }

    return post;
  }
}

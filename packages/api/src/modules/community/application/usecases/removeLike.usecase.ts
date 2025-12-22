/**
 * @file removeLike.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Remove Like from Post Use Case
 */

import { ILikeRepository } from '../../domain/repositories/ILikeRepository';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { NotFoundException } from '../../../../shared/core/exceptions/AppException';

export class RemoveLikeUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly postRepository: IPostRepository
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    // Check if post exists
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
    }

    // Check if like exists
    const like = await this.likeRepository.findByPostAndUser(postId, userId);
    if (!like) {
      throw new NotFoundException('Like not found', 'LIKE_NOT_FOUND');
    }

    // Delete like
    await this.likeRepository.deleteByPostAndUser(postId, userId);

    // Decrement post likes count
    await this.postRepository.decrementLikesCount(postId);
  }
}

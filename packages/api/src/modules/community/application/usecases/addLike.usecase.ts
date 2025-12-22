/**
 * @file addLike.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Add Like to Post Use Case
 */

import { v4 as uuidv4 } from 'uuid';
import { Like } from '../../domain/entities/like.entity';
import { ILikeRepository } from '../../domain/repositories/ILikeRepository';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { NotFoundException, ConflictException } from '../../../../shared/core/exceptions/AppException';

export class AddLikeUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly postRepository: IPostRepository
  ) {}

  async execute(postId: string, userId: string): Promise<Like> {
    // Check if post exists
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
    }

    // Check if user already liked the post
    const existingLike = await this.likeRepository.hasUserLikedPost(postId, userId);
    if (existingLike) {
      throw new ConflictException('You have already liked this post', 'ALREADY_LIKED');
    }

    // Create like
    const like = Like.create({
      id: uuidv4(),
      postId,
      userId,
    });

    const createdLike = await this.likeRepository.create(like);

    // Increment post likes count
    await this.postRepository.incrementLikesCount(postId);

    return createdLike;
  }
}

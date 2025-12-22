/**
 * @file getComments.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Get Comments for Post Use Case
 */

import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/ICommentRepository';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { NotFoundException } from '../../../../shared/core/exceptions/AppException';
import { FEED_CONSTANTS } from '../../domain/constants/feed.constants';

export interface GetCommentsDTO {
  postId: string;
  limit?: number;
  offset?: number;
}

export class GetCommentsUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly postRepository: IPostRepository
  ) {}

  async execute(dto: GetCommentsDTO): Promise<Comment[]> {
    // Check if post exists
    const post = await this.postRepository.findById(dto.postId);
    if (!post) {
      throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
    }

    const limit = Math.min(dto.limit || FEED_CONSTANTS.DEFAULT_PAGE_SIZE, FEED_CONSTANTS.MAX_PAGE_SIZE);
    const offset = dto.offset || 0;

    return await this.commentRepository.findByPostId(dto.postId, limit, offset);
  }
}

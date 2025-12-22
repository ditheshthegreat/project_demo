/**
 * @file addComment.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Add Comment to Post Use Case
 */

import { v4 as uuidv4 } from 'uuid';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/ICommentRepository';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { NotFoundException } from '../../../../shared/core/exceptions/AppException';

export interface AddCommentDTO {
  postId: string;
  userId: string;
  content: string;
}

export class AddCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly postRepository: IPostRepository
  ) {}

  async execute(dto: AddCommentDTO): Promise<Comment> {
    // Check if post exists
    const post = await this.postRepository.findById(dto.postId);
    if (!post) {
      throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
    }

    // Create comment
    const comment = Comment.create({
      id: uuidv4(),
      postId: dto.postId,
      userId: dto.userId,
      content: dto.content,
    });

    const createdComment = await this.commentRepository.create(comment);

    // Increment post comments count
    await this.postRepository.incrementCommentsCount(dto.postId);

    return createdComment;
  }
}

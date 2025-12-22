/**
 * @file deleteComment.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Delete Comment Use Case
 */

import { ICommentRepository } from '../../domain/repositories/ICommentRepository';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';

export class DeleteCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly postRepository: IPostRepository
  ) {}

  async execute(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found', 'COMMENT_NOT_FOUND');
    }

    if (!comment.canBeDeletedBy(userId)) {
      throw new ForbiddenException('You do not have permission to delete this comment', 'FORBIDDEN');
    }

    await this.commentRepository.softDelete(commentId);

    // Decrement post comments count
    await this.postRepository.decrementCommentsCount(comment.postId);
  }
}

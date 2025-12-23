/**
 * @file updateComment.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Update Comment Use Case
 */

import { ICommentRepository } from '../../domain/repositories/ICommentRepository';
import { Comment } from '../../domain/entities/comment.entity';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';

export interface UpdateCommentDTO {
  commentId: string;
  userId: string;
  content: string;
}

export class UpdateCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(dto: UpdateCommentDTO): Promise<Comment> {
    const { commentId, userId, content } = dto;

    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found', 'COMMENT_NOT_FOUND');
    }

    if (!comment.canBeEditedBy(userId)) {
      throw new ForbiddenException('You do not have permission to edit this comment', 'FORBIDDEN');
    }

    const updatedComment = await this.commentRepository.update(commentId, {
      content,
    });

    return updatedComment;
  }
}

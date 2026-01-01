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
import { CreateNotificationUseCase } from '../../../notifications/application/usecases/createNotification.usecase';
import { NotificationType } from '../../../notifications/domain/entities/notification.entity';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export interface AddCommentDTO {
  postId: string;
  userId: string;
  content: string;
}

export class AddCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly postRepository: IPostRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase
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

    // Send notification to post owner (after comment is saved)
    await this.sendCommentNotification(post.userId, dto.userId, dto.postId);

    return createdComment;
  }

  /**
   * Send notification for feed comment
   * Uses CreateNotificationUseCase - includes self-check and FCM sending
   */
  private async sendCommentNotification(
    feedOwnerId: string,
    actorId: string,
    feedId: string
  ): Promise<void> {
    try {
      // Get actor name for notification body
      const actor = await prisma.user.findUnique({
        where: { id: actorId },
        select: { name: true },
      });

      if (!actor) {
        return;
      }

      // CreateNotificationUseCase handles:
      // - Self-notification prevention (receiverId === actorId)
      // - Database insertion
      // - FCM push sending (fire-and-forget)
      await this.createNotificationUseCase.execute({
        userId: feedOwnerId,
        actorId: actorId,
        type: NotificationType.COMMENT,
        entityId: feedId,
        title: 'New comment',
        body: `${actor.name} commented on your post`,
      });
    } catch (error) {
      // Fail silently - notifications should never break comment functionality
      console.error('[AddComment] Failed to send notification:', error);
    }
  }
}

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
import { CreateNotificationUseCase } from '../../../notifications/application/usecases/createNotification.usecase';
import { NotificationType } from '../../../notifications/domain/entities/notification.entity';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class AddLikeUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly postRepository: IPostRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase
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

    // Send notification to post owner (after like is saved)
    await this.sendLikeNotification(post.userId, userId, postId);

    return createdLike;
  }

  /**
   * Send notification for feed like
   * Uses CreateNotificationUseCase - includes self-check and FCM sending
   */
  private async sendLikeNotification(
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
        type: NotificationType.LIKE,
        entityId: feedId,
        title: 'New like',
        body: `${actor.name} liked your post`,
      });
    } catch (error) {
      // Fail silently - notifications should never break like functionality
      console.error('[AddLike] Failed to send notification:', error);
    }
  }
}

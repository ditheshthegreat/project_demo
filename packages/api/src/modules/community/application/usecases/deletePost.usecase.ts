/**
 * @file deletePost.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Delete Post Use Case
 */

import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';

export class DeletePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
    }

    if (!post.canBeDeletedBy(userId)) {
      throw new ForbiddenException('You do not have permission to delete this post', 'FORBIDDEN');
    }

    await this.postRepository.softDelete(postId);
  }
}

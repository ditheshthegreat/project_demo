/**
 * @file createPost.usecase.ts
 * @module Community/Application/UseCases
 * @layer Application
 * @description Create Post Use Case
 */

import { v4 as uuidv4 } from 'uuid';
import { FeedPost } from '../../domain/entities/feedPost.entity';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { FeedType, Visibility } from '../../domain/constants/feed.constants';
import { BadRequestException } from '../../../../shared/core/exceptions/AppException';

export interface CreatePostDTO {
  userId: string;
  feedType: FeedType;
  visibility: Visibility;
  content: string;
  imageUrl?: string;
  images?: Array<{
    id: string;
    s3Key: string;
    url: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    width?: number;
    height?: number;
    order: number;
  }>;
}

export class CreatePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(dto: CreatePostDTO): Promise<FeedPost> {
    // Validate max 5 images
    if (dto.images && dto.images.length > 5) {
      throw new BadRequestException(
        'Maximum 5 images allowed per post',
        'MAX_IMAGES_EXCEEDED'
      );
    }

    const post = FeedPost.create({
      id: uuidv4(),
      userId: dto.userId,
      feedType: dto.feedType,
      visibility: dto.visibility,
      content: dto.content,
      imageUrl: dto.imageUrl || null,
      images: dto.images || [],
    });

    return await this.postRepository.create(post);
  }
}

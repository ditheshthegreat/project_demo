/**
 * @file postRepository.impl.ts
 * @module Community/Infrastructure/Database
 * @layer Infrastructure
 * @description Post Repository Implementation using Prisma
 */

import { FeedPost } from '../../domain/entities/feedPost.entity';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { s3Service } from '../../../../shared/infra/storage/s3.service';

export class PostRepositoryImpl implements IPostRepository {
  /**
   * Helper method to generate signed URLs for images
   */
  private async generateSignedUrls(images: any[]): Promise<Array<{
    id: string;
    s3Key: string;
    url: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    width?: number;
    height?: number;
    order: number;
  }>> {
    return Promise.all(
      images.map(async (img) => ({
        id: img.id,
        s3Key: img.s3Key,
        url: await s3Service.getSignedUrl(img.s3Key),
        filename: img.filename,
        mimeType: img.mimeType,
        fileSize: img.fileSize,
        width: img.width || undefined,
        height: img.height || undefined,
        order: img.order,
      }))
    );
  }

  async findById(id: string): Promise<FeedPost | null> {
    const post = await prisma.feedPost.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!post || post.isDeleted) {
      return null;
    }

    return FeedPost.create({
      id: post.id,
      userId: post.userId,
      feedType: post.feedType as any,
      visibility: post.visibility as any,
      content: post.content,
      imageUrl: post.imageUrl,
      images: await this.generateSignedUrls(post.images),
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      isDeleted: post.isDeleted,
      deletedAt: post.deletedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  }

  async findByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<FeedPost[]> {
    const posts = await prisma.feedPost.findMany({
      where: { userId, isDeleted: false },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return Promise.all(posts.map(async post => FeedPost.create({
      id: post.id,
      userId: post.userId,
      feedType: post.feedType as any,
      visibility: post.visibility as any,
      content: post.content,
      imageUrl: post.imageUrl,
      images: await this.generateSignedUrls(post.images),
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      isDeleted: post.isDeleted,
      deletedAt: post.deletedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })));
  }

  async findFeedPosts(userId: string, limit: number = 20, offset: number = 0): Promise<FeedPost[]> {
    // MVP: Just get all public posts for now (friends filtering comes later)
    const posts = await prisma.feedPost.findMany({
      where: {
        isDeleted: false,
        OR: [
          { visibility: 'public' },
          { userId }, // Include user's own posts regardless of visibility
        ],
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return Promise.all(posts.map(async post => FeedPost.create({
      id: post.id,
      userId: post.userId,
      feedType: post.feedType as any,
      visibility: post.visibility as any,
      content: post.content,
      imageUrl: post.imageUrl,
      images: await this.generateSignedUrls(post.images),
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      isDeleted: post.isDeleted,
      deletedAt: post.deletedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })));
  }

  async create(post: FeedPost): Promise<FeedPost> {
    const created = await prisma.feedPost.create({
      data: {
        id: post.id,
        userId: post.userId,
        feedType: post.feedType,
        visibility: post.visibility,
        content: post.content,
        imageUrl: post.imageUrl,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        isDeleted: post.isDeleted,
        deletedAt: post.deletedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        images: {
          create: post.images.map((img, index) => ({
            id: img.id,
            s3Key: img.s3Key,
            filename: img.filename,
            mimeType: img.mimeType,
            fileSize: img.fileSize,
            width: img.width,
            height: img.height,
            order: index,
            status: 'ready',
          }))
        }
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return FeedPost.create({
      id: created.id,
      userId: created.userId,
      feedType: created.feedType as any,
      visibility: created.visibility as any,
      content: created.content,
      imageUrl: created.imageUrl,
      images: await this.generateSignedUrls(created.images),
      likesCount: created.likesCount,
      commentsCount: created.commentsCount,
      isDeleted: created.isDeleted,
      deletedAt: created.deletedAt,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(id: string, data: Partial<{ content: string; imageUrl: string | null }>): Promise<FeedPost> {
    const updated = await prisma.feedPost.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return FeedPost.create({
      id: updated.id,
      userId: updated.userId,
      feedType: updated.feedType as any,
      visibility: updated.visibility as any,
      content: updated.content,
      imageUrl: updated.imageUrl,
      images: await this.generateSignedUrls(updated.images),
      likesCount: updated.likesCount,
      commentsCount: updated.commentsCount,
      isDeleted: updated.isDeleted,
      deletedAt: updated.deletedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async incrementLikesCount(id: string): Promise<FeedPost> {
    const updated = await prisma.feedPost.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return FeedPost.create({
      id: updated.id,
      userId: updated.userId,
      feedType: updated.feedType as any,
      visibility: updated.visibility as any,
      content: updated.content,
      imageUrl: updated.imageUrl,
      images: await this.generateSignedUrls(updated.images),
      likesCount: updated.likesCount,
      commentsCount: updated.commentsCount,
      isDeleted: updated.isDeleted,
      deletedAt: updated.deletedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async decrementLikesCount(id: string): Promise<FeedPost> {
    const updated = await prisma.feedPost.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return FeedPost.create({
      id: updated.id,
      userId: updated.userId,
      feedType: updated.feedType as any,
      visibility: updated.visibility as any,
      content: updated.content,
      imageUrl: updated.imageUrl,
      images: await this.generateSignedUrls(updated.images),
      likesCount: updated.likesCount,
      commentsCount: updated.commentsCount,
      isDeleted: updated.isDeleted,
      deletedAt: updated.deletedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async incrementCommentsCount(id: string): Promise<FeedPost> {
    const updated = await prisma.feedPost.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return FeedPost.create({
      id: updated.id,
      userId: updated.userId,
      feedType: updated.feedType as any,
      visibility: updated.visibility as any,
      content: updated.content,
      imageUrl: updated.imageUrl,
      images: await this.generateSignedUrls(updated.images),
      likesCount: updated.likesCount,
      commentsCount: updated.commentsCount,
      isDeleted: updated.isDeleted,
      deletedAt: updated.deletedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async decrementCommentsCount(id: string): Promise<FeedPost> {
    const updated = await prisma.feedPost.update({
      where: { id },
      data: { commentsCount: { decrement: 1 } },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return FeedPost.create({
      id: updated.id,
      userId: updated.userId,
      feedType: updated.feedType as any,
      visibility: updated.visibility as any,
      content: updated.content,
      imageUrl: updated.imageUrl,
      images: await this.generateSignedUrls(updated.images),
      likesCount: updated.likesCount,
      commentsCount: updated.commentsCount,
      isDeleted: updated.isDeleted,
      deletedAt: updated.deletedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.feedPost.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.feedPost.delete({
      where: { id },
    });
  }
}

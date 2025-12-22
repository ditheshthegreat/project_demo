/**
 * @file likeRepository.impl.ts
 * @module Community/Infrastructure/Database
 * @layer Infrastructure
 * @description Like Repository Implementation using Prisma
 */

import { Like } from '../../domain/entities/like.entity';
import { ILikeRepository } from '../../domain/repositories/ILikeRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class LikeRepositoryImpl implements ILikeRepository {
  async findById(id: string): Promise<Like | null> {
    const like = await prisma.feedLike.findUnique({
      where: { id },
    });

    if (!like) {
      return null;
    }

    return Like.create({
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt,
    });
  }

  async findByPostAndUser(postId: string, userId: string): Promise<Like | null> {
    const like = await prisma.feedLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!like) {
      return null;
    }

    return Like.create({
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt,
    });
  }

  async findByPostId(postId: string, limit: number = 20, offset: number = 0): Promise<Like[]> {
    const likes = await prisma.feedLike.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return likes.map(like => Like.create({
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt,
    }));
  }

  async findByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<Like[]> {
    const likes = await prisma.feedLike.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return likes.map(like => Like.create({
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt,
    }));
  }

  async countByPostId(postId: string): Promise<number> {
    return await prisma.feedLike.count({
      where: { postId },
    });
  }

  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    const like = await prisma.feedLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    return like !== null;
  }

  async create(like: Like): Promise<Like> {
    const created = await prisma.feedLike.create({
      data: {
        id: like.id,
        postId: like.postId,
        userId: like.userId,
        createdAt: like.createdAt,
      },
    });

    return Like.create({
      id: created.id,
      postId: created.postId,
      userId: created.userId,
      createdAt: created.createdAt,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.feedLike.delete({
      where: { id },
    });
  }

  async deleteByPostAndUser(postId: string, userId: string): Promise<void> {
    await prisma.feedLike.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
  }

  async deleteByPostId(postId: string): Promise<void> {
    await prisma.feedLike.deleteMany({
      where: { postId },
    });
  }
}

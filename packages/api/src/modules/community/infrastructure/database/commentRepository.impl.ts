/**
 * @file commentRepository.impl.ts
 * @module Community/Infrastructure/Database
 * @layer Infrastructure
 * @description Comment Repository Implementation using Prisma
 */

import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/ICommentRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class CommentRepositoryImpl implements ICommentRepository {
  async findById(id: string): Promise<Comment | null> {
    const comment = await prisma.feedComment.findUnique({
      where: { id },
    });

    if (!comment || comment.isDeleted) {
      return null;
    }

    return Comment.create({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      isDeleted: comment.isDeleted,
      deletedAt: comment.deletedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  }

  async findByPostId(postId: string, limit: number = 20, offset: number = 0): Promise<Comment[]> {
    const comments = await prisma.feedComment.findMany({
      where: {
        postId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });

    return comments.map(comment => Comment.create({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      isDeleted: comment.isDeleted,
      deletedAt: comment.deletedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  }

  async findByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<Comment[]> {
    const comments = await prisma.feedComment.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return comments.map(comment => Comment.create({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      isDeleted: comment.isDeleted,
      deletedAt: comment.deletedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  }

  async countByPostId(postId: string): Promise<number> {
    return await prisma.feedComment.count({
      where: {
        postId,
        isDeleted: false,
      },
    });
  }

  async create(comment: Comment): Promise<Comment> {
    const created = await prisma.feedComment.create({
      data: {
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        isDeleted: comment.isDeleted,
        deletedAt: comment.deletedAt,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });

    return Comment.create({
      id: created.id,
      postId: created.postId,
      userId: created.userId,
      content: created.content,
      isDeleted: created.isDeleted,
      deletedAt: created.deletedAt,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(id: string, data: Partial<{ content: string }>): Promise<Comment> {
    const updated = await prisma.feedComment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return Comment.create({
      id: updated.id,
      postId: updated.postId,
      userId: updated.userId,
      content: updated.content,
      isDeleted: updated.isDeleted,
      deletedAt: updated.deletedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.feedComment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.feedComment.delete({
      where: { id },
    });
  }

  async deleteByPostId(postId: string): Promise<void> {
    await prisma.feedComment.deleteMany({
      where: { postId },
    });
  }
}

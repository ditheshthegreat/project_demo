/**
 * @file feed.controller.ts
 * @module Community/Interfaces/Controllers
 * @layer Interface
 * @description Feed Controller - HTTP handlers for feed operations
 */

import { Request, Response, NextFunction } from 'express';
import { CreatePostUseCase } from '../../application/usecases/createPost.usecase';
import { GetFeedUseCase } from '../../application/usecases/getFeed.usecase';
import { GetPostByIdUseCase } from '../../application/usecases/getPostById.usecase';
import { DeletePostUseCase } from '../../application/usecases/deletePost.usecase';
import { AddLikeUseCase } from '../../application/usecases/addLike.usecase';
import { RemoveLikeUseCase } from '../../application/usecases/removeLike.usecase';
import { AddCommentUseCase } from '../../application/usecases/addComment.usecase';
import { GetCommentsUseCase } from '../../application/usecases/getComments.usecase';
import { DeleteCommentUseCase } from '../../application/usecases/deleteComment.usecase';
import { UpdateCommentUseCase } from '../../application/usecases/updateComment.usecase';
import { GetFeedSettingsUseCase } from '../../application/usecases/getFeedSettings.usecase';
import { UpdateFeedSettingsUseCase } from '../../application/usecases/updateFeedSettings.usecase';
import { ReportFeedUseCase } from '../../application/usecases/reportFeed.usecase';
import { CreatePostDtoSchema } from '../dto/createPost.dto';
import { CreateCommentDtoSchema } from '../dto/createComment.dto';
import { UpdateCommentDtoSchema } from '../dto/updateComment.dto';
import { UpdateFeedSettingsDtoSchema } from '../dto/updateFeedSettings.dto';
import { ReportFeedDtoSchema } from '../dto/feedReport.dto';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';
import { s3Service } from '../../../../shared/infra/storage/s3.service';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class FeedController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getFeedUseCase: GetFeedUseCase,
    private readonly getPostByIdUseCase: GetPostByIdUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly addLikeUseCase: AddLikeUseCase,
    private readonly removeLikeUseCase: RemoveLikeUseCase,
    private readonly addCommentUseCase: AddCommentUseCase,
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly getFeedSettingsUseCase: GetFeedSettingsUseCase,
    private readonly updateFeedSettingsUseCase: UpdateFeedSettingsUseCase,
    private readonly reportFeedUseCase: ReportFeedUseCase
  ) {}

  /**
   * Helper method to get database user ID from Firebase UID
   */
  private async getUserIdFromFirebaseUid(firebaseUid: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true }
    });
    return user?.id || null;
  }

  /**
   * Create a new feed post
   * POST /community/feed
   */
  async createPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get database user ID from Firebase UID
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found. Please call /api/auth/verify first.',
        });
        return;
      }

      const validated = CreatePostDtoSchema.parse(req.body);

      // Upload images to S3
      const imageMetadata: Array<{
        id: string;
        s3Key: string;
        url: string;
        filename: string;
        mimeType: string;
        fileSize: number;
        order: number;
      }> = [];

      if (req.files && Array.isArray(req.files)) {
        const uploadResults = await s3Service.uploadFiles(
          req.files.map(file => ({
            buffer: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
          }))
        );
        
        imageMetadata.push(...uploadResults.map((result, index) => ({
          id: require('uuid').v4(),
          s3Key: result.key,
          url: result.url,
          filename: result.filename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          order: index,
        })));
      }

      const post = await this.createPostUseCase.execute({
        userId: user.id,
        feedType: validated.feedType,
        visibility: validated.visibility,
        content: validated.content,
        imageUrl: validated.imageUrl,
        images: imageMetadata.length > 0 ? imageMetadata : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post.toJSON(),
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Get feed posts
   * GET /community/feed
   */
  async getFeed(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const posts = await this.getFeedUseCase.execute({
        userId,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        message: 'Feed retrieved successfully',
        data: posts.map(post => post.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single post by ID
   * GET /community/feed/:postId
   */
  async getPostById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { postId } = req.params;

      const post = await this.getPostByIdUseCase.execute(postId, userId);

      res.status(200).json({
        success: true,
        message: 'Post retrieved successfully',
        data: post.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a post
   * DELETE /community/feed/:postId
   */
  async deletePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get database user ID from Firebase UID
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { postId } = req.params;

      await this.deletePostUseCase.execute(postId, user.id);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add like to a post
   * POST /community/feed/:postId/like
   */
  async addLike(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { postId } = req.params;

      const like = await this.addLikeUseCase.execute(postId, userId);

      res.status(201).json({
        success: true,
        message: 'Post liked successfully',
        data: like.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove like from a post
   * DELETE /community/feed/:postId/like
   */
  async removeLike(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { postId } = req.params;

      await this.removeLikeUseCase.execute(postId, userId);

      res.status(200).json({
        success: true,
        message: 'Like removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add comment to a post
   * POST /community/feed/:postId/comment
   */
  async addComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { postId } = req.params;
      const validated = CreateCommentDtoSchema.parse(req.body);

      const comment = await this.addCommentUseCase.execute({
        postId,
        userId,
        content: validated.content,
      });

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment.toJSON(),
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Get comments for a post
   * GET /community/feed/:postId/comments
   */
  async getComments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { postId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const comments = await this.getCommentsUseCase.execute({
        postId,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        message: 'Comments retrieved successfully',
        data: comments.map(comment => comment.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a comment
   * PUT /community/comment/:commentId
   */
  async updateComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { commentId } = req.params;
      const validated = UpdateCommentDtoSchema.parse(req.body);

      const comment = await this.updateCommentUseCase.execute({
        commentId,
        userId,
        content: validated.content,
      });

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment.toJSON(),
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Delete a comment
   * DELETE /community/comment/:commentId
   */
  async deleteComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { commentId } = req.params;

      await this.deleteCommentUseCase.execute(commentId, userId);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feed settings
   * GET /community/feed/settings
   */
  async getFeedSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const settings = await this.getFeedSettingsUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: 'Feed settings retrieved successfully',
        data: settings.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update feed settings
   * PUT /community/feed/settings
   */
  async updateFeedSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const validated = UpdateFeedSettingsDtoSchema.parse(req.body);

      const settings = await this.updateFeedSettingsUseCase.execute({
        userId,
        ...validated,
      });

      res.status(200).json({
        success: true,
        message: 'Feed settings updated successfully',
        data: settings.toJSON(),
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /feed/:feedId/report
   * Report a feed post
   */
  async reportFeed(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get database user ID
      const userId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!userId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { feedId } = req.params;

      if (!feedId) {
        res.status(400).json({
          success: false,
          message: 'Feed ID is required',
        });
        return;
      }

      const validated = ReportFeedDtoSchema.parse(req.body);

      const report = await this.reportFeedUseCase.execute({
        reporterId: userId,
        feedId,
        reason: validated.reason,
        description: validated.description,
      });

      res.status(201).json({
        success: true,
        data: report.toJSON(),
        message: 'Feed post reported successfully',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }
}

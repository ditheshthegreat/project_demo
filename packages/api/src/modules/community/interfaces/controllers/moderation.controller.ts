/**
 * @file moderation.controller.ts
 * @module Community/Interfaces/Controllers
 * @layer Interface
 * @description Moderation Controller - User blocking and reporting
 */

import { Response } from 'express';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';
import { BlockUserUseCase } from '../../application/usecases/blockUser.usecase';
import { UnblockUserUseCase } from '../../application/usecases/unblockUser.usecase';
import { ReportUserUseCase } from '../../application/usecases/reportUser.usecase';
import { GetBlockedUsersUseCase } from '../../application/usecases/getBlockedUsers.usecase';
import { ReportUserDtoSchema } from '../dto/report.dto';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class ModerationController {
  constructor(
    private readonly blockUserUseCase: BlockUserUseCase,
    private readonly unblockUserUseCase: UnblockUserUseCase,
    private readonly reportUserUseCase: ReportUserUseCase,
    private readonly getBlockedUsersUseCase: GetBlockedUsersUseCase
  ) {}

  /**
   * POST /community/block/:userId
   * Block a user
   */
  async blockUser(req: AuthRequest, res: Response): Promise<void> {
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
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { userId: blockedId } = req.params;

      if (!blockedId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const block = await this.blockUserUseCase.execute({
        blockerId: user.id,
        blockedId,
      });

      res.status(201).json({
        success: true,
        data: block.toJSON(),
        message: 'User blocked successfully',
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * DELETE /community/block/:userId
   * Unblock a user
   */
  async unblockUser(req: AuthRequest, res: Response): Promise<void> {
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
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { userId: blockedId } = req.params;

      if (!blockedId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      await this.unblockUserUseCase.execute({
        blockerId: user.id,
        blockedId,
      });

      res.status(200).json({
        success: true,
        message: 'User unblocked successfully',
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * GET /community/blocked
   * Get list of blocked users
   */
  async getBlockedUsers(req: AuthRequest, res: Response): Promise<void> {
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
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const blockedUsers = await this.getBlockedUsersUseCase.execute({
        userId: user.id,
      });

      // Get blocked user details
      const blockedUserIds = blockedUsers.map(b => b.blockedId);
      const userDetails = await prisma.user.findMany({
        where: {
          id: { in: blockedUserIds },
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      });

      const blockedUsersWithDetails = blockedUsers.map(block => {
        const userDetail = userDetails.find(u => u.id === block.blockedId);
        return {
          ...block.toJSON(),
          user: userDetail || null,
        };
      });

      res.status(200).json({
        success: true,
        data: blockedUsersWithDetails,
        message: 'Blocked users retrieved successfully',
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * POST /community/report/:userId
   * Report a user
   */
  async reportUser(req: AuthRequest, res: Response): Promise<void> {
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
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { userId: reportedUserId } = req.params;

      if (!reportedUserId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const validated = ReportUserDtoSchema.parse(req.body);

      const report = await this.reportUserUseCase.execute({
        reporterId: user.id,
        reportedUserId,
        reason: validated.reason,
        description: validated.description,
      });

      res.status(201).json({
        success: true,
        data: report.toJSON(),
        message: 'User reported successfully',
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
      throw error;
    }
  }
}

/**
 * @file profile.controller.ts
 * @module Community/Interfaces/Controllers
 * @layer Interface
 * @description Profile Controller - HTTP handlers for user profile operations
 */

import { Request, Response, NextFunction } from 'express';
import { GetUserProfileUseCase } from '../../application/usecases/getUserProfile.usecase';
import { GetMyProfileUseCase } from '../../application/usecases/getMyProfile.usecase';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class ProfileController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly getMyProfileUseCase: GetMyProfileUseCase
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
   * Get user profile by ID
   * GET /community/profile/:userId
   */
  async getUserProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const currentUserId = await this.getUserIdFromFirebaseUid(firebaseUid);
      if (!currentUserId) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { userId } = req.params;

      const profile = await this.getUserProfileUseCase.execute(userId, currentUserId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's own profile
   * GET /community/profile/me
   */
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const profile = await this.getMyProfileUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

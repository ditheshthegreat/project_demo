/**
 * @file profile.controller.ts
 * @module Community/Interfaces/Controllers
 * @layer Interface
 * @description Profile Controller - HTTP handlers for user profile operations
 */

import { Request, Response } from 'express';
import { GetUserProfileUseCase } from '../../application/usecases/getUserProfile.usecase';
import { GetMyProfileUseCase } from '../../application/usecases/getMyProfile.usecase';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';

export class ProfileController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly getMyProfileUseCase: GetMyProfileUseCase
  ) {}

  /**
   * Get user profile by ID
   * GET /community/profile/:userId
   */
  async getUserProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.uid;
      if (!currentUserId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
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
      throw error;
    }
  }

  /**
   * Get current user's own profile
   * GET /community/profile/me
   */
  async getMyProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
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
      throw error;
    }
  }
}

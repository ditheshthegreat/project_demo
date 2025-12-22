/**
 * @file explore.controller.ts
 * @module Community/Interfaces/Controllers
 * @layer Interface
 * @description Explore Controller - HTTP handlers for user discovery
 */

import { Request, Response } from 'express';
import { ExploreUsersUseCase } from '../../application/usecases/exploreUsers.usecase';
import { SearchUsersUseCase } from '../../application/usecases/searchUsers.usecase';
import { NearbyUsersUseCase } from '../../application/usecases/nearbyUsers.usecase';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';

export class ExploreController {
  constructor(
    private readonly exploreUsersUseCase: ExploreUsersUseCase,
    private readonly searchUsersUseCase: SearchUsersUseCase,
    private readonly nearbyUsersUseCase: NearbyUsersUseCase
  ) {}

  /**
   * Explore users
   * GET /community/explore
   */
  async explore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const filters = {
        interests: req.query.interests ? (Array.isArray(req.query.interests) ? req.query.interests : [req.query.interests]) as string[] : undefined,
        skills: req.query.skills ? (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]) as string[] : undefined,
        accessibilityNeeds: req.query.accessibilityNeeds ? (Array.isArray(req.query.accessibilityNeeds) ? req.query.accessibilityNeeds : [req.query.accessibilityNeeds]) as string[] : undefined,
        distanceKm: req.query.distanceKm ? parseInt(req.query.distanceKm as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const users = await this.exploreUsersUseCase.execute(userId, filters);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search users
   * GET /community/explore/search
   */
  async search(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const filters = {
        name: req.query.name as string | undefined,
        interests: req.query.interests ? (Array.isArray(req.query.interests) ? req.query.interests : [req.query.interests]) as string[] : undefined,
        skills: req.query.skills ? (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]) as string[] : undefined,
        accessibilityNeeds: req.query.accessibilityNeeds ? (Array.isArray(req.query.accessibilityNeeds) ? req.query.accessibilityNeeds : [req.query.accessibilityNeeds]) as string[] : undefined,
        distanceKm: req.query.distanceKm ? parseInt(req.query.distanceKm as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const users = await this.searchUsersUseCase.execute(userId, filters);

      res.status(200).json({
        success: true,
        message: 'Search results retrieved successfully',
        data: users,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find nearby users
   * GET /community/explore/nearby
   */
  async nearby(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const filters = {
        interests: req.query.interests ? (Array.isArray(req.query.interests) ? req.query.interests : [req.query.interests]) as string[] : undefined,
        skills: req.query.skills ? (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]) as string[] : undefined,
        accessibilityNeeds: req.query.accessibilityNeeds ? (Array.isArray(req.query.accessibilityNeeds) ? req.query.accessibilityNeeds : [req.query.accessibilityNeeds]) as string[] : undefined,
        distanceKm: req.query.distanceKm ? parseInt(req.query.distanceKm as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const users = await this.nearbyUsersUseCase.execute(userId, filters);

      res.status(200).json({
        success: true,
        message: 'Nearby users retrieved successfully',
        data: users,
      });
    } catch (error) {
      throw error;
    }
  }
}

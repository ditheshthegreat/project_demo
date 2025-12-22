/**
 * @file profile.routes.ts
 * @module Community/Interfaces/Routes
 * @layer Interface
 * @description Profile Routes with Swagger Documentation
 */

import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class ProfileRoutes {
  private router: Router;

  constructor(private readonly profileController: ProfileController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/community/profile/me:
     *   get:
     *     summary: Get my profile
     *     description: Retrieve current user's profile with stats
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Profile retrieved successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     firebaseUid:
     *                       type: string
     *                     name:
     *                       type: string
     *                     email:
     *                       type: string
     *                     profileImage:
     *                       type: string
     *                     gender:
     *                       type: string
     *                     city:
     *                       type: string
     *                     federalState:
     *                       type: string
     *                     description:
     *                       type: string
     *                     interests:
     *                       type: array
     *                       items:
     *                         type: string
     *                     hobbies:
     *                       type: array
     *                       items:
     *                         type: string
     *                     accessibilityRequirements:
     *                       type: array
     *                       items:
     *                         type: string
     *                     postsCount:
     *                       type: integer
     *                       example: 25
     *                     friendsCount:
     *                       type: integer
     *                       example: 42
     *                     mutualFriendsCount:
     *                       type: integer
     *                       example: 0
     *                     isFriend:
     *                       type: boolean
     *                       example: false
     *                     hasPendingRequest:
     *                       type: boolean
     *                       example: false
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/me',
      verifyAuth,
      (req, res) => this.profileController.getMyProfile(req, res)
    );

    /**
     * @swagger
     * /api/community/profile/{userId}:
     *   get:
     *     summary: Get user profile
     *     description: Retrieve another user's profile with stats and relationship info
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: User's Firebase UID
     *     responses:
     *       200:
     *         description: Profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Profile retrieved successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     firebaseUid:
     *                       type: string
     *                     name:
     *                       type: string
     *                       example: "John Doe"
     *                     email:
     *                       type: string
     *                       example: "john@example.com"
     *                     profileImage:
     *                       type: string
     *                     gender:
     *                       type: string
     *                       example: "male"
     *                     city:
     *                       type: string
     *                       example: "Berlin"
     *                     federalState:
     *                       type: string
     *                       example: "Berlin"
     *                     description:
     *                       type: string
     *                       example: "Tech enthusiast and accessibility advocate"
     *                     interests:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["sports", "music", "technology"]
     *                     hobbies:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["photography", "cooking"]
     *                     accessibilityRequirements:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["wheelchair-access"]
     *                     postsCount:
     *                       type: integer
     *                       description: Number of posts created by user
     *                       example: 25
     *                     friendsCount:
     *                       type: integer
     *                       description: Number of friends user has
     *                       example: 42
     *                     mutualFriendsCount:
     *                       type: integer
     *                       description: Number of mutual friends with current user
     *                       example: 5
     *                     isFriend:
     *                       type: boolean
     *                       description: Whether current user is friends with this user
     *                       example: true
     *                     hasPendingRequest:
     *                       type: boolean
     *                       description: Whether there's a pending friend request
     *                       example: false
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Profile not available (privacy settings)
     *       404:
     *         description: User not found
     */
    this.router.get(
      '/:userId',
      verifyAuth,
      (req, res) => this.profileController.getUserProfile(req, res)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

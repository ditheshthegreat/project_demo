/**
 * @file explore.routes.ts
 * @module Community/Interfaces/Routes
 * @layer Interface
 * @description Explore Routes with Swagger Documentation
 */

import { Router } from 'express';
import { ExploreController } from '../controllers/explore.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class ExploreRoutes {
  private router: Router;

  constructor(private readonly exploreController: ExploreController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/community/explore:
     *   get:
     *     summary: Explore users
     *     description: Discover users based on interests, skills, and accessibility needs
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: interests
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by interests
     *         example: ["sports", "music"]
     *       - in: query
     *         name: skills
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by skills/hobbies
     *         example: ["photography", "cooking"]
     *       - in: query
     *         name: accessibilityNeeds
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by accessibility requirements
     *         example: ["wheelchair-access"]
     *       - in: query
     *         name: distanceKm
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 500
     *         description: Maximum distance in kilometers
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 50
     *           default: 20
     *         description: Number of results to return
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of results to skip
     *     responses:
     *       200:
     *         description: Users retrieved successfully
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
     *                   example: "Users retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                       firebaseUid:
     *                         type: string
     *                       name:
     *                         type: string
     *                       profileImage:
     *                         type: string
     *                       gender:
     *                         type: string
     *                       city:
     *                         type: string
     *                       federalState:
     *                         type: string
     *                       interests:
     *                         type: array
     *                         items:
     *                           type: string
     *                       hobbies:
     *                         type: array
     *                         items:
     *                           type: string
     *                       accessibilityRequirements:
     *                         type: array
     *                         items:
     *                           type: string
     *                       description:
     *                         type: string
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/',
      verifyAuth,
      (req, res) => this.exploreController.explore(req, res)
    );

    /**
     * @swagger
     * /api/community/explore/search:
     *   get:
     *     summary: Search users by name
     *     description: Search for users by name with optional filters
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Search by name (case-insensitive)
     *         example: "John"
     *       - in: query
     *         name: interests
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by interests
     *       - in: query
     *         name: skills
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by skills/hobbies
     *       - in: query
     *         name: accessibilityNeeds
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by accessibility requirements
     *       - in: query
     *         name: distanceKm
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 500
     *         description: Maximum distance in kilometers
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 50
     *           default: 20
     *         description: Number of results to return
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of results to skip
     *     responses:
     *       200:
     *         description: Search results retrieved successfully
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
     *                   example: "Search results retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                       firebaseUid:
     *                         type: string
     *                       name:
     *                         type: string
     *                       profileImage:
     *                         type: string
     *                       city:
     *                         type: string
     *                       interests:
     *                         type: array
     *                         items:
     *                           type: string
     *                       hobbies:
     *                         type: array
     *                         items:
     *                           type: string
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/search',
      verifyAuth,
      (req, res) => this.exploreController.search(req, res)
    );

    /**
     * @swagger
     * /api/community/explore/nearby:
     *   get:
     *     summary: Find nearby users
     *     description: Discover users in the same city based on location
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: interests
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by interests
     *       - in: query
     *         name: skills
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by skills/hobbies
     *       - in: query
     *         name: accessibilityNeeds
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         description: Filter by accessibility requirements
     *       - in: query
     *         name: distanceKm
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 500
     *         description: Maximum distance in kilometers
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 50
     *           default: 20
     *         description: Number of results to return
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of results to skip
     *     responses:
     *       200:
     *         description: Nearby users retrieved successfully
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
     *                   example: "Nearby users retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                       firebaseUid:
     *                         type: string
     *                       name:
     *                         type: string
     *                       profileImage:
     *                         type: string
     *                       city:
     *                         type: string
     *                       interests:
     *                         type: array
     *                         items:
     *                           type: string
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/nearby',
      verifyAuth,
      (req, res) => this.exploreController.nearby(req, res)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

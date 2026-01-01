/**
 * @file feed.routes.ts
 * @module Community/Interfaces/Routes
 * @layer Interface
 * @description Feed Routes with Swagger Documentation
 */

import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';
import { uploadImages } from '../../../../shared/middleware/upload.middleware';

export class FeedRoutes {
  private router: Router;

  constructor(private readonly feedController: FeedController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/community/feed:
     *   post:
     *     summary: Create a new feed post
     *     description: Create a new post in the community feed with optional image uploads (max 5 images)
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - feedType
     *               - visibility
     *               - content
     *             properties:
     *               feedType:
     *                 type: string
     *                 enum: [photo, location, review]
     *                 description: Type of feed post
     *               visibility:
     *                 type: string
     *                 enum: [public, friends, private]
     *                 description: Who can see this post
     *               content:
     *                 type: string
     *                 maxLength: 5000
     *                 description: Post content text
     *               imageUrl:
     *                 type: string
     *                 format: uri
     *                 description: Optional image URL (for backward compatibility)
     *               images:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *                 maxItems: 5
     *                 description: Upload up to 5 images (JPEG, PNG, or WebP)
     *     responses:
     *       201:
     *         description: Post created successfully
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
     *                   example: "Post created successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     userId:
     *                       type: string
     *                       format: uuid
     *                     feedType:
     *                       type: string
     *                       enum: [photo, location, review]
     *                     visibility:
     *                       type: string
     *                       enum: [public, friends, private]
     *                     content:
     *                       type: string
     *                     imageUrl:
     *                       type: string
     *                       nullable: true
     *                     likesCount:
     *                       type: integer
     *                     commentsCount:
     *                       type: integer
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      '/',
      verifyAuth,
      uploadImages as any,
      (req, res, next) => this.feedController.createPost(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed:
     *   get:
     *     summary: Get feed posts
     *     description: Retrieve posts for the authenticated user's feed (public posts and own posts)
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 50
     *           default: 20
     *         description: Number of posts to return
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of posts to skip (for pagination)
     *     responses:
     *       200:
     *         description: Feed retrieved successfully
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
     *                   example: "Feed retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       userId:
     *                         type: string
     *                         format: uuid
     *                       feedType:
     *                         type: string
     *                         enum: [photo, location, review]
     *                       visibility:
     *                         type: string
     *                         enum: [public, friends, private]
     *                       content:
     *                         type: string
     *                       imageUrl:
     *                         type: string
     *                         nullable: true
     *                       likesCount:
     *                         type: integer
     *                       commentsCount:
     *                         type: integer
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                       updatedAt:
     *                         type: string
     *                         format: date-time
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/',
      verifyAuth,
      (req, res, next) => this.feedController.getFeed(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/{postId}:
     *   get:
     *     summary: Get a specific post by ID
     *     description: Retrieve a single post by its ID (respects visibility permissions)
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Post ID
     *     responses:
     *       200:
     *         description: Post retrieved successfully
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
     *                   example: "Post retrieved successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     userId:
     *                       type: string
     *                       format: uuid
     *                     feedType:
     *                       type: string
     *                       enum: [photo, location, review]
     *                     visibility:
     *                       type: string
     *                       enum: [public, friends, private]
     *                     content:
     *                       type: string
     *                     imageUrl:
     *                       type: string
     *                       nullable: true
     *                     likesCount:
     *                       type: integer
     *                     commentsCount:
     *                       type: integer
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Post not found or not accessible
     */
    this.router.get(
      '/:postId',
      verifyAuth,
      (req, res, next) => this.feedController.getPostById(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/{postId}:
     *   delete:
     *     summary: Delete a post
     *     description: Delete a post (only the author can delete their own posts)
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Post ID
     *     responses:
     *       200:
     *         description: Post deleted successfully
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
     *                   example: "Post deleted successfully"
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - not the post author
     *       404:
     *         description: Post not found
     */
    this.router.delete(
      '/:postId',
      verifyAuth,
      (req, res, next) => this.feedController.deletePost(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/{postId}/like:
     *   post:
     *     summary: Like a post
     *     description: Add a like to a post (prevents duplicate likes)
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Post ID
     *     responses:
     *       201:
     *         description: Post liked successfully
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
     *                   example: "Post liked successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     postId:
     *                       type: string
     *                       format: uuid
     *                     userId:
     *                       type: string
     *                       format: uuid
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Post not found
     *       409:
     *         description: Already liked this post
     */
    this.router.post(
      '/:postId/like',
      verifyAuth,
      (req, res, next) => this.feedController.addLike(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/{postId}/like:
     *   delete:
     *     summary: Unlike a post
     *     description: Remove a like from a post
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Post ID
     *     responses:
     *       200:
     *         description: Like removed successfully
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
     *                   example: "Like removed successfully"
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Post or like not found
     */
    this.router.delete(
      '/:postId/like',
      verifyAuth,
      (req, res, next) => this.feedController.removeLike(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/{postId}/comment:
     *   post:
     *     summary: Add a comment to a post
     *     description: Create a new comment on a feed post
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Post ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - content
     *             properties:
     *               content:
     *                 type: string
     *                 maxLength: 1000
     *                 description: Comment text
     *           examples:
     *             simple:
     *               summary: Simple comment
     *               value:
     *                 content: "Great post! This is very helpful."
     *     responses:
     *       201:
     *         description: Comment added successfully
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
     *                   example: "Comment added successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     postId:
     *                       type: string
     *                       format: uuid
     *                     userId:
     *                       type: string
     *                       format: uuid
     *                     content:
     *                       type: string
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Post not found
     */
    this.router.post(
      '/:postId/comment',
      verifyAuth,
      (req, res, next) => this.feedController.addComment(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/{postId}/comments:
     *   get:
     *     summary: Get comments for a post
     *     description: Retrieve all comments for a specific post with pagination
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Post ID
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 50
     *           default: 20
     *         description: Number of comments to return
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of comments to skip
     *     responses:
     *       200:
     *         description: Comments retrieved successfully
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
     *                   example: "Comments retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       postId:
     *                         type: string
     *                         format: uuid
     *                       userId:
     *                         type: string
     *                         format: uuid
     *                       content:
     *                         type: string
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                       updatedAt:
     *                         type: string
     *                         format: date-time
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Post not found
     */
    this.router.get(
      '/:postId/comments',
      verifyAuth,
      (req, res, next) => this.feedController.getComments(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/settings:
     *   get:
     *     summary: Get feed settings
     *     description: Retrieve user's feed preferences (separate from onboarding)
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Feed settings retrieved successfully
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
     *                   example: "Feed settings retrieved successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     interests:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["sports", "music"]
     *                     accessibilityNeeds:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["wheelchair-access", "screen-reader"]
     *                     distanceKm:
     *                       type: number
     *                       example: 50
     *                     visibilityFilters:
     *                       type: object
     *                       properties:
     *                         showPublicPosts:
     *                           type: boolean
     *                         showFriendsPosts:
     *                           type: boolean
     *                         showNearbyPosts:
     *                           type: boolean
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      '/settings',
      verifyAuth,
      (req, res, next) => this.feedController.getFeedSettings(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/settings:
     *   put:
     *     summary: Update feed settings
     *     description: Update user's feed preferences
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               interests:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Interests to filter feed content
     *                 example: ["sports", "technology", "music"]
     *               accessibilityNeeds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Accessibility requirements
     *                 example: ["wheelchair-access", "hearing-assistance"]
     *               distanceKm:
     *                 type: number
     *                 minimum: 1
     *                 maximum: 500
     *                 description: Maximum distance for location-based content
     *                 example: 25
     *               visibilityFilters:
     *                 type: object
     *                 properties:
     *                   showPublicPosts:
     *                     type: boolean
     *                   showFriendsPosts:
     *                     type: boolean
     *                   showNearbyPosts:
     *                     type: boolean
     *           examples:
     *             full:
     *               summary: Update all settings
     *               value:
     *                 interests: ["sports", "music", "technology"]
     *                 accessibilityNeeds: ["wheelchair-access"]
     *                 distanceKm: 25
     *                 visibilityFilters:
     *                   showPublicPosts: true
     *                   showFriendsPosts: true
     *                   showNearbyPosts: false
     *             partial:
     *               summary: Update only distance
     *               value:
     *                 distanceKm: 100
     *     responses:
     *       200:
     *         description: Feed settings updated successfully
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
     *                   example: "Feed settings updated successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     interests:
     *                       type: array
     *                       items:
     *                         type: string
     *                     accessibilityNeeds:
     *                       type: array
     *                       items:
     *                         type: string
     *                     distanceKm:
     *                       type: number
     *                     visibilityFilters:
     *                       type: object
     *                       properties:
     *                         showPublicPosts:
     *                           type: boolean
     *                         showFriendsPosts:
     *                           type: boolean
     *                         showNearbyPosts:
     *                           type: boolean
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     */
    this.router.put(
      '/settings',
      verifyAuth,
      (req, res, next) => this.feedController.updateFeedSettings(req, res, next)
    );

    /**
     * @swagger
     * /api/community/feed/{feedId}/report:
     *   post:
     *     summary: Report a feed post
     *     description: |
     *       Report a feed post for inappropriate content.
     *       Reports are stored for admin review and do not immediately hide the post.
     *       
     *       **Rules:**
     *       - Cannot report your own post
     *       - Cannot report the same post twice
     *       - Report status is set to PENDING by default
     *       - Post remains visible until admin review
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - Soft-deleted users cannot report
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: feedId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of feed post to report
     *         example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - reason
     *             properties:
     *               reason:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 200
     *                 description: Short reason for report
     *                 example: "Inappropriate content"
     *               description:
     *                 type: string
     *                 maxLength: 1000
     *                 description: Optional detailed description
     *                 example: "This post contains offensive language and violates community guidelines."
     *     responses:
     *       201:
     *         description: Feed post reported successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     reporterId:
     *                       type: string
     *                       format: uuid
     *                     feedId:
     *                       type: string
     *                       format: uuid
     *                     reason:
     *                       type: string
     *                     description:
     *                       type: string
     *                       nullable: true
     *                     status:
     *                       type: string
     *                       enum: [PENDING, REVIEWED, RESOLVED]
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                 message:
     *                   type: string
     *                   example: "Feed post reported successfully"
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Cannot report your own post
     *       404:
     *         description: Feed post not found
     *       409:
     *         description: Already reported this post
     */
    this.router.post(
      '/:feedId/report',
      verifyAuth,
      (req, res, next) => this.feedController.reportFeed(req, res, next)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

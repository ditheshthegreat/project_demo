/**
 * @file comment.routes.ts
 * @module Community/Interfaces/Routes
 * @layer Interface
 * @description Comment Routes - HTTP routes for comment operations
 */

import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class CommentRoutes {
  private router: Router;

  constructor(private readonly feedController: FeedController) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @swagger
     * /api/community/comment/{commentId}:
     *   put:
     *     summary: Update a comment
     *     description: Edit an existing comment (only the comment author can edit)
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: commentId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Comment ID
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
     *                 minLength: 1
     *                 maxLength: 1000
     *                 description: Updated comment text
     *           examples:
     *             update:
     *               summary: Update comment
     *               value:
     *                 content: "Updated comment text with corrections"
     *     responses:
     *       200:
     *         description: Comment updated successfully
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
     *                   example: "Comment updated successfully"
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
     *                     isDeleted:
     *                       type: boolean
     *                     deletedAt:
     *                       type: string
     *                       format: date-time
     *                       nullable: true
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
     *       403:
     *         description: Forbidden - not the comment author
     *       404:
     *         description: Comment not found
     */
    this.router.put(
      '/:commentId',
      verifyAuth,
      (req, res, next) => this.feedController.updateComment(req, res, next)
    );

    /**
     * @swagger
     * /api/community/comment/{commentId}:
     *   delete:
     *     summary: Delete a comment
     *     description: Soft delete a comment (only the comment author can delete)
     *     tags: [Community]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: commentId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Comment ID
     *     responses:
     *       200:
     *         description: Comment deleted successfully
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
     *                   example: "Comment deleted successfully"
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - not the comment author
     *       404:
     *         description: Comment not found
     */
    this.router.delete(
      '/:commentId',
      verifyAuth,
      (req, res, next) => this.feedController.deleteComment(req, res, next)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

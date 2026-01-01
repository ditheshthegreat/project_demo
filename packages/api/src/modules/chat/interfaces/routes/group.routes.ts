/**
 * @file group.routes.ts
 * @module Chat/Interfaces/Routes
 * @layer Interface
 * @description Group Chat Routes - REST API endpoints for group management
 */

import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class GroupRoutes {
  public router: Router;
  private controller: GroupController;

  constructor(groupController: GroupController) {
    this.router = Router();
    this.controller = groupController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/chat/group:
     *   post:
     *     summary: Create a group conversation
     *     description: |
     *       Create a new group conversation with multiple participants.
     *       The creator becomes an ADMIN automatically.
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - Creator must not be soft-deleted
     *       - All participants must exist and not be deleted
     *       - Minimum 3 participants (creator + 2 others)
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - participantIds
     *             properties:
     *               name:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 example: "Project Team"
     *               participantIds:
     *                 type: array
     *                 minItems: 2
     *                 items:
     *                   type: string
     *                   format: uuid
     *                 example: ["user-id-1", "user-id-2"]
     *     responses:
     *       201:
     *         description: Group created successfully
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     */
    this.router.post('/', verifyAuth, this.controller.createGroup.bind(this.controller));

    /**
     * @swagger
     * /api/chat/group/{id}/add:
     *   post:
     *     summary: Add member to group
     *     description: |
     *       Add a new member to an existing group conversation.
     *       
     *       **Security:**
     *       - Only group ADMINs can add members
     *       - User to add must exist and not be deleted
     *       - User cannot already be a member
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Group conversation ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 format: uuid
     *                 example: "user-id-to-add"
     *     responses:
     *       200:
     *         description: Member added successfully
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Only admins can add members
     *       404:
     *         description: Group or user not found
     */
    this.router.post('/:id/add', verifyAuth, this.controller.addMember.bind(this.controller));

    /**
     * @swagger
     * /api/chat/group/{id}/remove:
     *   post:
     *     summary: Remove member from group
     *     description: |
     *       Remove a member from a group conversation.
     *       
     *       **Security:**
     *       - Only group ADMINs can remove members
     *       - Cannot remove yourself (use leave endpoint)
     *       - User must be a current member
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Group conversation ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 format: uuid
     *                 example: "user-id-to-remove"
     *     responses:
     *       200:
     *         description: Member removed successfully
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Only admins can remove members
     *       404:
     *         description: Group or user not found
     */
    this.router.post('/:id/remove', verifyAuth, this.controller.removeMember.bind(this.controller));

    /**
     * @swagger
     * /api/chat/group/{id}/leave:
     *   post:
     *     summary: Leave a group
     *     description: |
     *       Leave a group conversation.
     *       
     *       **Rules:**
     *       - Last admin cannot leave if members remain (must promote another admin first)
     *       - If last member leaves, group is soft-deleted
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Group conversation ID
     *     responses:
     *       200:
     *         description: Left group successfully
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Cannot leave as last admin
     *       404:
     *         description: Group not found
     */
    this.router.post('/:id/leave', verifyAuth, this.controller.leaveGroup.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}

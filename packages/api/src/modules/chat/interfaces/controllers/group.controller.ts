/**
 * @file group.controller.ts
 * @module Chat/Interfaces/Controllers
 * @layer Interface
 * @description Group Chat Controller - HTTP handlers for group management
 */

import { Response } from 'express';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';
import { CreateGroupUseCase } from '../../application/usecases/createGroup.usecase';
import { AddGroupMemberUseCase } from '../../application/usecases/addGroupMember.usecase';
import { RemoveGroupMemberUseCase } from '../../application/usecases/removeGroupMember.usecase';
import { LeaveGroupUseCase } from '../../application/usecases/leaveGroup.usecase';
import { CreateGroupDtoSchema, AddGroupMemberDtoSchema, RemoveGroupMemberDtoSchema } from '../dto/group.dto';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class GroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly addGroupMemberUseCase: AddGroupMemberUseCase,
    private readonly removeGroupMemberUseCase: RemoveGroupMemberUseCase,
    private readonly leaveGroupUseCase: LeaveGroupUseCase
  ) {}

  /**
   * POST /chat/group
   * Create a new group conversation
   */
  async createGroup(req: AuthRequest, res: Response): Promise<void> {
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

      const validated = CreateGroupDtoSchema.parse(req.body);

      const group = await this.createGroupUseCase.execute({
        creatorId: user.id,
        name: validated.name,
        participantIds: validated.participantIds,
      });

      res.status(201).json({
        success: true,
        data: group,
        message: 'Group created successfully',
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

  /**
   * POST /chat/group/:id/add
   * Add a member to group (admin only)
   */
  async addMember(req: AuthRequest, res: Response): Promise<void> {
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

      const { id: conversationId } = req.params;
      const validated = AddGroupMemberDtoSchema.parse(req.body);

      const participant = await this.addGroupMemberUseCase.execute({
        conversationId,
        adminId: user.id,
        userIdToAdd: validated.userId,
      });

      res.status(200).json({
        success: true,
        data: participant,
        message: 'Member added successfully',
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

  /**
   * POST /chat/group/:id/remove
   * Remove a member from group (admin only)
   */
  async removeMember(req: AuthRequest, res: Response): Promise<void> {
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

      const { id: conversationId } = req.params;
      const validated = RemoveGroupMemberDtoSchema.parse(req.body);

      await this.removeGroupMemberUseCase.execute({
        conversationId,
        adminId: user.id,
        userIdToRemove: validated.userId,
      });

      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
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

  /**
   * POST /chat/group/:id/leave
   * Leave a group conversation
   */
  async leaveGroup(req: AuthRequest, res: Response): Promise<void> {
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

      const { id: conversationId } = req.params;

      await this.leaveGroupUseCase.execute({
        conversationId,
        userId: user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Left group successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}

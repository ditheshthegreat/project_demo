/**
 * @file friend.controller.ts
 * @module Community/Interfaces/Controllers
 * @layer Interface
 * @description Friend Controller - HTTP handlers for friend operations
 */

import { Request, Response } from 'express';
import { SendFriendRequestUseCase } from '../../application/usecases/sendFriendRequest.usecase';
import { GetPendingRequestsUseCase } from '../../application/usecases/getPendingRequests.usecase';
import { AcceptFriendRequestUseCase } from '../../application/usecases/acceptFriendRequest.usecase';
import { RejectFriendRequestUseCase } from '../../application/usecases/rejectFriendRequest.usecase';
import { GetFriendsUseCase } from '../../application/usecases/getFriends.usecase';
import { RemoveFriendUseCase } from '../../application/usecases/removeFriend.usecase';
import { SendFriendRequestDtoSchema, HandleFriendRequestDtoSchema } from '../dto/friendRequest.dto';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';

export class FriendController {
  constructor(
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly getPendingRequestsUseCase: GetPendingRequestsUseCase,
    private readonly acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private readonly rejectFriendRequestUseCase: RejectFriendRequestUseCase,
    private readonly getFriendsUseCase: GetFriendsUseCase,
    private readonly removeFriendUseCase: RemoveFriendUseCase
  ) {}

  /**
   * Send friend request
   * POST /community/friend/request
   */
  async sendRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const validated = SendFriendRequestDtoSchema.parse(req.body);

      const request = await this.sendFriendRequestUseCase.execute(userId, validated.recipientId);

      res.status(201).json({
        success: true,
        message: 'Friend request sent successfully',
        data: request.toJSON(),
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
   * Get pending friend requests
   * GET /community/friend/requests
   */
  async getPendingRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const requests = await this.getPendingRequestsUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: 'Pending requests retrieved successfully',
        data: requests.map(req => req.toJSON()),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Accept friend request
   * POST /community/friend/accept
   */
  async acceptRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const validated = HandleFriendRequestDtoSchema.parse(req.body);

      const friendship = await this.acceptFriendRequestUseCase.execute(validated.requestId, userId);

      res.status(200).json({
        success: true,
        message: 'Friend request accepted',
        data: friendship.toJSON(),
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
   * Reject friend request
   * POST /community/friend/reject
   */
  async rejectRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const validated = HandleFriendRequestDtoSchema.parse(req.body);

      await this.rejectFriendRequestUseCase.execute(validated.requestId, userId);

      res.status(200).json({
        success: true,
        message: 'Friend request rejected',
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
   * Get friends list
   * GET /community/friends
   */
  async getFriends(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const friends = await this.getFriendsUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: 'Friends retrieved successfully',
        data: friends.map(friend => friend.toJSON()),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove friend
   * DELETE /community/friend/remove/:userId
   */
  async removeFriend(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { userId: friendId } = req.params;

      await this.removeFriendUseCase.execute(userId, friendId);

      res.status(200).json({
        success: true,
        message: 'Friend removed successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}

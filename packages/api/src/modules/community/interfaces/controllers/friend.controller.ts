/**
 * @file friend.controller.ts
 * @module Community/Interfaces/Controllers
 * @layer Interface
 * @description Friend Controller - HTTP handlers for friend operations
 */

import { Request, Response, NextFunction } from 'express';
import { SendFriendRequestUseCase } from '../../application/usecases/sendFriendRequest.usecase';
import { GetPendingRequestsUseCase } from '../../application/usecases/getPendingRequests.usecase';
import { AcceptFriendRequestUseCase } from '../../application/usecases/acceptFriendRequest.usecase';
import { RejectFriendRequestUseCase } from '../../application/usecases/rejectFriendRequest.usecase';
import { GetFriendsUseCase } from '../../application/usecases/getFriends.usecase';
import { RemoveFriendUseCase } from '../../application/usecases/removeFriend.usecase';
import { CancelFriendRequestUseCase } from '../../application/usecases/cancelFriendRequest.usecase';
import { SendFriendRequestDtoSchema, HandleFriendRequestDtoSchema } from '../dto/friendRequest.dto';
import { AuthRequest } from '../../../../shared/middleware/verifyAuth.middleware';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { s3Service } from '../../../../shared/infra/storage/s3.service';

export class FriendController {
  constructor(
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly getPendingRequestsUseCase: GetPendingRequestsUseCase,
    private readonly acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private readonly rejectFriendRequestUseCase: RejectFriendRequestUseCase,
    private readonly getFriendsUseCase: GetFriendsUseCase,
    private readonly removeFriendUseCase: RemoveFriendUseCase,
    private readonly cancelFriendRequestUseCase: CancelFriendRequestUseCase
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
   * Send friend request
   * POST /community/friend/request
   */
  async sendRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Get pending friend requests
   * GET /community/friend/requests
   */
  async getPendingRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const requests = await this.getPendingRequestsUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: 'Pending requests retrieved successfully',
        data: requests.map(req => req.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept friend request
   * POST /community/friend/accept
   */
  async acceptRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Reject friend request
   * POST /community/friend/reject
   */
  async rejectRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Get friends list with user profiles
   * GET /community/friends
   */
  async getFriends(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const friendships = await this.getFriendsUseCase.execute(userId);

      // Fetch friend user profiles
      const friendProfiles = await Promise.all(
        friendships.map(async (friendship) => {
          const friendUser = await prisma.user.findUnique({
            where: { id: friendship.friendId },
            select: {
              id: true,
              firebaseUid: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
              age: true,
              gender: true,
              location: true,
              description: true,
              interests: true,
              hobbies: true,
              createdAt: true,
            },
          });

          if (!friendUser) return null;

          // Generate signed URL for profile image
          let profileImageUrl = friendUser.profileImage;
          if (profileImageUrl) {
            try {
              profileImageUrl = await s3Service.getSignedUrl(profileImageUrl);
            } catch (error) {
              profileImageUrl = null;
            }
          }

          return {
            ...friendUser,
            profileImage: profileImageUrl,
            friendshipId: friendship.id,
            friendsSince: friendship.acceptedAt,
          };
        })
      );

      // Filter out null entries (deleted users)
      const validFriendProfiles = friendProfiles.filter(profile => profile !== null);

      res.status(200).json({
        success: true,
        message: 'Friends retrieved successfully',
        data: validFriendProfiles,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel friend request
   * DELETE /community/friend/request/:requestId
   */
  async cancelFriendRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const { requestId } = req.params;

      await this.cancelFriendRequestUseCase.execute(userId, requestId);

      res.status(200).json({
        success: true,
        message: 'Friend request cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove friend
   * DELETE /community/friend/remove/:userId
   */
  async removeFriend(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const { userId: friendId } = req.params;

      await this.removeFriendUseCase.execute(userId, friendId);

      res.status(200).json({
        success: true,
        message: 'Friend removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

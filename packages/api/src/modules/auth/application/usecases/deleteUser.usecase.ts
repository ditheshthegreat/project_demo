/**
 * @file deleteUser.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Delete User Use Case - Soft delete user account
 */

import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';
import { NotFoundException, ConflictException } from '../../../../shared/core/exceptions/AppException';
import { CreateNotificationUseCase } from '../../../notifications/application/usecases/createNotification.usecase';
import { NotificationType } from '../../../notifications/domain/entities/notification.entity';

export interface DeleteUserDTO {
  firebaseUid: string;
  hardDelete?: boolean; // If true, also delete from Firebase
}

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase
  ) {}

  async execute(dto: DeleteUserDTO): Promise<void> {
    const user = await this.userRepository.findByFirebaseUid(dto.firebaseUid);

    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    if (user.isDeleted) {
      throw new ConflictException('User account already deleted', 'USER_ALREADY_DELETED');
    }

    // Soft delete in database
    await this.userRepository.softDelete(user.id);

    // Create audit notification (no push notification)
    await this.createAuditNotification(user.id);

    // Optionally hard delete from Firebase
    if (dto.hardDelete) {
      try {
        await firebaseAuth.deleteUser(dto.firebaseUid);
      } catch (error) {
        // Log error but don't fail the operation
        console.error('Failed to delete user from Firebase:', error);
      }
    }
  }

  /**
   * Create audit notification for account deletion
   * Stores notification for audit purposes only - no push sent
   */
  private async createAuditNotification(userId: string): Promise<void> {
    try {
      // CreateNotificationUseCase with skipPush = true
      // Stores notification in database but does not send FCM push
      await this.createNotificationUseCase.execute({
        userId: userId,
        actorId: userId, // System notification
        type: NotificationType.SYSTEM,
        entityId: userId,
        title: 'Account deleted',
        body: 'Your account has been deleted',
        skipPush: true, // Audit-only, no push notification
      });
    } catch (error) {
      // Fail silently - audit notification should not break deletion
      console.error('[DeleteUser] Failed to create audit notification:', error);
    }
  }
}

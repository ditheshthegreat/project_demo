/**
 * @file deleteUser.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Delete User Use Case - Soft delete user account
 */

import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';
import { NotFoundException, ConflictException } from '../../../../shared/core/exceptions/AppException';

export interface DeleteUserDTO {
  firebaseUid: string;
  hardDelete?: boolean; // If true, also delete from Firebase
}

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

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
}

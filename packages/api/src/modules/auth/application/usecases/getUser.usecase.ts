/**
 * @file getUser.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Get User Use Case - Retrieve authenticated user's profile
 */

import { User } from '../../domain/user.entity';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';

export interface GetUserDTO {
  firebaseUid: string;
}

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: GetUserDTO): Promise<User> {
    const user = await this.userRepository.findByFirebaseUid(dto.firebaseUid);

    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    if (user.isDeleted) {
      throw new ForbiddenException('User account has been deleted', 'USER_DELETED');
    }

    return user;
  }
}

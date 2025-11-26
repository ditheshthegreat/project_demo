/**
 * @file getUser.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Get User Use Case - Retrieve authenticated user's profile
 */

import { User } from '../../domain/user.entity';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface GetUserDTO {
  firebaseUid: string;
}

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: GetUserDTO): Promise<User> {
    const user = await this.userRepository.findByFirebaseUid(dto.firebaseUid);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isDeleted) {
      throw new Error('User account has been deleted');
    }

    return user;
  }
}

/**
 * @file updateUser.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Update User Use Case - Update user profile
 */

import { User } from '../../domain/user.entity';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { NotFoundException, ForbiddenException } from '../../../../shared/core/exceptions/AppException';

export interface UpdateUserDTO {
  firebaseUid: string;
  name?: string;
  phone?: string;
  age?: number;
  gender?: string;
  location?: any;
  accessibility?: any;
  preferences?: any;
  profileImage?: string;
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findByFirebaseUid(dto.firebaseUid);

    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    if (user.isDeleted) {
      throw new ForbiddenException('User account has been deleted', 'USER_DELETED');
    }

    // Update user with new data
    const updatedUser = await this.userRepository.update(user.id, {
      name: dto.name,
      phone: dto.phone,
      age: dto.age,
      gender: dto.gender,
      location: dto.location,
      accessibility: dto.accessibility,
      preferences: dto.preferences,
      profileImage: dto.profileImage,
    });

    return updatedUser;
  }
}

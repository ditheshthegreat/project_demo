/**
 * @file userRepositoryImpl.ts
 * @module Auth/Infrastructure/Database
 * @layer Infrastructure
 * @description User Repository Implementation (Adapter)
 * 
 * Implements the IUserRepository interface using Prisma ORM.
 * Maps between domain User entities and Prisma database models.
 * 
 * **Responsibilities:**
 * - Execute database queries for user operations
 * - Map Prisma records to domain entities
 * - Handle database errors
 * 
 * **Database:**
 * - Uses PostgreSQL via Prisma
 * - Table: users (mapped from User model)
 * 
 * @example
 * const repo = new UserRepositoryImpl();
 * const user = await repo.findByFirebaseUid('firebase-uid-123');
 */

import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/user.entity";
import { prisma } from "../../../../shared/infra/prisma/prismaClient";

/**
 * User Repository Implementation
 * 
 * Prisma-based implementation of user persistence operations.
 */
export class UserRepositoryImpl implements IUserRepository {
  /**
   * Find user by database ID
   */
  async findById(id: string): Promise<User | null> {
    const userRecord = await prisma.user.findUnique({
      where: { id },
    });

    if (!userRecord) {
      return null;
    }

    return User.create({
      id: userRecord.id,
      firebaseUid: userRecord.firebaseUid,
      email: userRecord.email,
      name: userRecord.name,
      phone: userRecord.phone,
      profileImage: userRecord.profileImage,
      gender: userRecord.gender,
      age: userRecord.age,
      location: userRecord.location,
      accessibility: userRecord.accessibility,
      preferences: userRecord.preferences,
      isDeleted: userRecord.isDeleted,
      deletedAt: userRecord.deletedAt,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    });
  }

  /**
   * Find user by Firebase UID
   */
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const userRecord = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!userRecord) {
      return null;
    }

    return User.create({
      id: userRecord.id,
      firebaseUid: userRecord.firebaseUid,
      email: userRecord.email,
      name: userRecord.name,
      phone: userRecord.phone,
      profileImage: userRecord.profileImage,
      gender: userRecord.gender,
      age: userRecord.age,
      location: userRecord.location,
      accessibility: userRecord.accessibility,
      preferences: userRecord.preferences,
      isDeleted: userRecord.isDeleted,
      deletedAt: userRecord.deletedAt,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    });
  }

  /**
   * Find user by email address
   */
  async findByEmail(email: string): Promise<User | null> {
    const userRecord = await prisma.user.findFirst({
      where: { email },
    });

    if (!userRecord) {
      return null;
    }

    return User.create({
      id: userRecord.id,
      firebaseUid: userRecord.firebaseUid,
      email: userRecord.email,
      name: userRecord.name,
      phone: userRecord.phone,
      profileImage: userRecord.profileImage,
      gender: userRecord.gender,
      age: userRecord.age,
      location: userRecord.location,
      accessibility: userRecord.accessibility,
      preferences: userRecord.preferences,
      isDeleted: userRecord.isDeleted,
      deletedAt: userRecord.deletedAt,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    });
  }

  /**
   * Create new user
   */
  async create(user: User): Promise<User> {
    const userRecord = await prisma.user.create({
      data: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
      },
    });

    return User.create({
      id: userRecord.id,
      firebaseUid: userRecord.firebaseUid,
      email: userRecord.email,
      name: userRecord.name,
      phone: userRecord.phone,
      profileImage: userRecord.profileImage,
      gender: userRecord.gender,
      age: userRecord.age,
      location: userRecord.location,
      accessibility: userRecord.accessibility,
      preferences: userRecord.preferences,
      isDeleted: userRecord.isDeleted,
      deletedAt: userRecord.deletedAt,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    });
  }

  /**
   * Update existing user with partial data
   */
  async update(id: string, data: Partial<{
    name?: string;
    phone?: string;
    age?: number;
    gender?: string;
    location?: any;
    accessibility?: any;
    preferences?: any;
    profileImage?: string;
  }>): Promise<User> {
    const userRecord = await prisma.user.update({
      where: { id },
      data,
    });

    return User.create({
      id: userRecord.id,
      firebaseUid: userRecord.firebaseUid,
      email: userRecord.email,
      name: userRecord.name,
      phone: userRecord.phone,
      profileImage: userRecord.profileImage,
      gender: userRecord.gender,
      age: userRecord.age,
      location: userRecord.location,
      accessibility: userRecord.accessibility,
      preferences: userRecord.preferences,
      isDeleted: userRecord.isDeleted,
      deletedAt: userRecord.deletedAt,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    });
  }

  /**
   * Soft delete user by ID
   */
  async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Hard delete user by ID
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}

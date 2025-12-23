/**
 * @file pushToken.repository.impl.ts
 * @description Implementation of push token repository using Prisma
 */

import { PrismaClient } from '@prisma/client';
import { PushTokenRepository } from '../../domain/repositories/pushToken.repository';
import { PushToken, DeviceType } from '../../domain/entities/pushToken.entity';

const prisma = new PrismaClient();

export class PushTokenRepositoryImpl implements PushTokenRepository {
  async saveToken(
    userId: string,
    token: string,
    deviceType: DeviceType,
    deviceId?: string
  ): Promise<PushToken> {
    const existingToken = await prisma.pushToken.findUnique({
      where: {
        userId_token: {
          userId,
          token,
        },
      },
    });

    if (existingToken) {
      const updated = await prisma.pushToken.update({
        where: { id: existingToken.id },
        data: {
          deviceType,
          deviceId,
          isActive: true,
          updatedAt: new Date(),
        },
      });

      return this.mapToDomain(updated);
    }

    const created = await prisma.pushToken.create({
      data: {
        userId,
        token,
        deviceType,
        deviceId,
        isActive: true,
      },
    });

    return this.mapToDomain(created);
  }

  async deactivateToken(token: string, userId: string): Promise<void> {
    await prisma.pushToken.updateMany({
      where: {
        token,
        userId,
        deletedAt: null,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async getActiveTokensByUser(userId: string): Promise<PushToken[]> {
    const tokens = await prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tokens.map(this.mapToDomain);
  }

  async findToken(userId: string, token: string): Promise<PushToken | null> {
    const pushToken = await prisma.pushToken.findUnique({
      where: {
        userId_token: {
          userId,
          token,
        },
      },
    });

    return pushToken ? this.mapToDomain(pushToken) : null;
  }

  private mapToDomain(data: any): PushToken {
    return {
      id: data.id,
      userId: data.userId,
      token: data.token,
      deviceType: data.deviceType as DeviceType,
      deviceId: data.deviceId,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}

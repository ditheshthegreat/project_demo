/**
 * @file feedSettingsRepository.impl.ts
 * @module Community/Infrastructure/Database
 * @layer Infrastructure
 * @description Feed Settings Repository Implementation using Prisma
 */

import { FeedSettings } from '../../domain/value-objects/feedSettings.vo';
import { IFeedSettingsRepository } from '../../domain/repositories/IFeedSettingsRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class FeedSettingsRepositoryImpl implements IFeedSettingsRepository {
  async getByUserId(userId: string): Promise<FeedSettings | null> {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
      select: { feedPreferences: true },
    });

    if (!user || !user.feedPreferences) {
      return null;
    }

    return FeedSettings.fromJSON(user.feedPreferences);
  }

  async update(userId: string, settings: FeedSettings): Promise<FeedSettings> {
    await prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        feedPreferences: settings.toJSON() as any,
      },
    });

    return settings;
  }
}

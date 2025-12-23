/**
 * @file removePushToken.usecase.ts
 * @description Use case for removing/deactivating FCM push token
 */

import { PushTokenRepository } from '../../domain/repositories/pushToken.repository';

export interface RemovePushTokenInput {
  userId: string;
  token: string;
}

export class RemovePushTokenUseCase {
  constructor(private pushTokenRepository: PushTokenRepository) {}

  async execute(input: RemovePushTokenInput): Promise<void> {
    const existingToken = await this.pushTokenRepository.findToken(
      input.userId,
      input.token
    );

    if (!existingToken) {
      throw new Error('Token not found');
    }

    if (existingToken.userId !== input.userId) {
      throw new Error('Unauthorized: Cannot remove token owned by another user');
    }

    await this.pushTokenRepository.deactivateToken(input.token, input.userId);
  }
}

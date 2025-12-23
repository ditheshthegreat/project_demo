/**
 * @file registerPushToken.usecase.ts
 * @description Use case for registering FCM push token
 */

import { PushTokenRepository } from '../../domain/repositories/pushToken.repository';
import { DeviceType } from '../../domain/entities/pushToken.entity';

export interface RegisterPushTokenInput {
  userId: string;
  token: string;
  deviceType: DeviceType;
  deviceId?: string;
}

export class RegisterPushTokenUseCase {
  constructor(private pushTokenRepository: PushTokenRepository) {}

  async execute(input: RegisterPushTokenInput): Promise<void> {
    await this.pushTokenRepository.saveToken(
      input.userId,
      input.token,
      input.deviceType,
      input.deviceId
    );
  }
}

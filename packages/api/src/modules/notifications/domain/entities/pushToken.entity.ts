/**
 * @file pushToken.entity.ts
 * @description Domain entity for push notification tokens
 */

export enum DeviceType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  deviceType: DeviceType;
  deviceId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

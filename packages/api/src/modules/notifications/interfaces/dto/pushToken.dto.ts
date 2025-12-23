/**
 * @file pushToken.dto.ts
 * @description DTOs and validation schemas for push token endpoints
 */

import { z } from 'zod';
import { DeviceType } from '../../domain/entities/pushToken.entity';

export const RegisterPushTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  deviceType: z.enum(['ANDROID', 'IOS', 'WEB'], {
    required_error: 'Device type is required',
    invalid_type_error: 'Invalid device type',
  }),
  deviceId: z.string().optional(),
});

export type RegisterPushTokenDto = z.infer<typeof RegisterPushTokenSchema>;

export const RemovePushTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type RemovePushTokenDto = z.infer<typeof RemovePushTokenSchema>;

export function validateRegisterPushToken(data: any): RegisterPushTokenDto {
  return RegisterPushTokenSchema.parse(data);
}

export function validateRemovePushToken(data: any): RemovePushTokenDto {
  return RemovePushTokenSchema.parse(data);
}

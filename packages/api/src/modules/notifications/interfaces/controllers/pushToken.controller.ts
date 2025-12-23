/**
 * @file pushToken.controller.ts
 * @description Controller for push token management
 */

import { Request, Response, NextFunction } from 'express';
import { PushTokenRepositoryImpl } from '../../infrastructure/database/pushToken.repository.impl';
import { RegisterPushTokenUseCase } from '../../application/usecases/registerPushToken.usecase';
import { RemovePushTokenUseCase } from '../../application/usecases/removePushToken.usecase';
import {
  validateRegisterPushToken,
  validateRemovePushToken,
} from '../dto/pushToken.dto';
import { DeviceType } from '../../domain/entities/pushToken.entity';

interface AuthRequest extends Request {
  user?: {
    uid: string;
  };
}

export class PushTokenController {
  private repository = new PushTokenRepositoryImpl();

  async registerToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const validatedData = validateRegisterPushToken(req.body);

      const useCase = new RegisterPushTokenUseCase(this.repository);
      await useCase.execute({
        userId,
        token: validatedData.token,
        deviceType: validatedData.deviceType as DeviceType,
        deviceId: validatedData.deviceId,
      });

      res.status(200).json({
        success: true,
        message: 'Push token registered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const validatedData = validateRemovePushToken(req.body);

      const useCase = new RemovePushTokenUseCase(this.repository);
      await useCase.execute({
        userId,
        token: validatedData.token,
      });

      res.status(200).json({
        success: true,
        message: 'Push token removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

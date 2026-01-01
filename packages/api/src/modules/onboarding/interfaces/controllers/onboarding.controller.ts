/**
 * @file onboarding.controller.ts
 * @description Controller for onboarding endpoints
 */

import { Request, Response } from 'express';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { OnboardingRepositoryImpl } from '../../infrastructure/database/onboarding.repository.impl';
import { NotificationRepositoryImpl } from '../../../notifications/infrastructure/database/notification.repository.impl';
import { CreateNotificationUseCase } from '../../../notifications/application/usecases/createNotification.usecase';
import {
  Step1BasicInfoUseCase,
  Step2LocationUseCase,
  Step3InterestsUseCase,
  Step4HobbiesUseCase,
  Step5RequirementsUseCase,
  Step5ToolsUseCase,
  Step5LookingForUseCase,
  Step5CommunicationUseCase,
  Step6PrivacyUseCase,
  CompleteOnboardingUseCase,
  GetOnboardingStatusUseCase,
} from '../../application/usecases';
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5Requirements,
  validateStep5Tools,
  validateStep5LookingFor,
  validateStep5Communication,
  validateStep6,
} from '../dto/index';

export class OnboardingController {
  private repository = new OnboardingRepositoryImpl(prisma);
  private notificationRepository = new NotificationRepositoryImpl();
  private createNotificationUseCase = new CreateNotificationUseCase(this.notificationRepository);

  /**
   * POST /onboarding/step1 - Basic Information
   */
  async step1(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep1(req.body);
      const useCase = new Step1BasicInfoUseCase(this.repository);

      await useCase.execute({
        userId,
        gender: validatedData.gender,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        description: validatedData.description,
      });

      res.status(200).json({
        success: true,
        message: 'Step 1 completed successfully',
        data: { step: 1 },
      });
    } catch (error: any) {
      console.error('Step 1 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 1',
      });
    }
  }

  /**
   * POST /onboarding/step2 - Location Information
   */
  async step2(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep2(req.body);
      const useCase = new Step2LocationUseCase(this.repository);

      await useCase.execute({
        userId,
        ...validatedData,
      });

      res.status(200).json({
        success: true,
        message: 'Step 2 completed successfully',
        data: { step: 2 },
      });
    } catch (error: any) {
      console.error('Step 2 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 2',
      });
    }
  }

  /**
   * POST /onboarding/step3 - Interests
   */
  async step3(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep3(req.body);
      const useCase = new Step3InterestsUseCase(this.repository);

      await useCase.execute({
        userId,
        interests: validatedData.interests,
      });

      res.status(200).json({
        success: true,
        message: 'Step 3 completed successfully',
        data: { step: 3, count: validatedData.interests.length },
      });
    } catch (error: any) {
      console.error('Step 3 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 3',
      });
    }
  }

  /**
   * POST /onboarding/step4 - Hobbies
   */
  async step4(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep4(req.body);
      const useCase = new Step4HobbiesUseCase(this.repository);

      await useCase.execute({
        userId,
        hobbies: validatedData.hobbies,
      });

      res.status(200).json({
        success: true,
        message: 'Step 4 completed successfully',
        data: { step: 4, count: validatedData.hobbies.length },
      });
    } catch (error: any) {
      console.error('Step 4 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 4',
      });
    }
  }

  /**
   * POST /onboarding/step5/requirements - Accessibility Requirements
   */
  async step5Requirements(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep5Requirements(req.body);
      const useCase = new Step5RequirementsUseCase(this.repository);

      await useCase.execute({
        userId,
        accessibilityRequirements: validatedData.accessibilityRequirements,
      });

      res.status(200).json({
        success: true,
        message: 'Step 5.1 completed successfully',
        data: { step: '5.1' },
      });
    } catch (error: any) {
      console.error('Step 5.1 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 5.1',
      });
    }
  }

  /**
   * POST /onboarding/step5/tools - Accessibility Tools
   */
  async step5Tools(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep5Tools(req.body);
      const useCase = new Step5ToolsUseCase(this.repository);

      await useCase.execute({
        userId,
        accessibilityTools: validatedData.accessibilityTools,
      });

      res.status(200).json({
        success: true,
        message: 'Step 5.2 completed successfully',
        data: { step: '5.2' },
      });
    } catch (error: any) {
      console.error('Step 5.2 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 5.2',
      });
    }
  }

  /**
   * POST /onboarding/step5/looking-for - What Are You Looking For
   */
  async step5LookingFor(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep5LookingFor(req.body);
      const useCase = new Step5LookingForUseCase(this.repository);

      await useCase.execute({
        userId,
        lookingFor: validatedData.lookingFor,
      });

      res.status(200).json({
        success: true,
        message: 'Step 5.3 completed successfully',
        data: { step: '5.3' },
      });
    } catch (error: any) {
      console.error('Step 5.3 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 5.3',
      });
    }
  }

  /**
   * POST /onboarding/step5/communication - Communication Preferences
   */
  async step5Communication(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep5Communication(req.body);
      const useCase = new Step5CommunicationUseCase(this.repository);

      await useCase.execute({
        userId,
        communicationPreferences: validatedData.communicationPreferences,
      });

      res.status(200).json({
        success: true,
        message: 'Step 5.4 completed successfully',
        data: { step: '5.4' },
      });
    } catch (error: any) {
      console.error('Step 5.4 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 5.4',
      });
    }
  }

  /**
   * POST /onboarding/step6 - Privacy Settings
   */
  async step6(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = validateStep6(req.body);
      const useCase = new Step6PrivacyUseCase(this.repository);

      await useCase.execute({
        userId,
        ...validatedData,
      });

      res.status(200).json({
        success: true,
        message: 'Step 6 completed successfully',
        data: { step: 6 },
      });
    } catch (error: any) {
      console.error('Step 6 error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete step 6',
      });
    }
  }

  /**
   * POST /onboarding/complete - Complete Onboarding
   */
  async complete(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const useCase = new CompleteOnboardingUseCase(this.repository, this.createNotificationUseCase);
      await useCase.execute({ userId });

      res.status(200).json({
        success: true,
        message: 'Onboarding completed successfully',
        data: { completed: true },
      });
    } catch (error: any) {
      console.error('Complete onboarding error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete onboarding',
      });
    }
  }

  /**
   * GET /onboarding/status - Get Onboarding Status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const useCase = new GetOnboardingStatusUseCase(this.repository);
      const status = await useCase.execute({ userId });

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      console.error('Get status error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get onboarding status',
      });
    }
  }
}

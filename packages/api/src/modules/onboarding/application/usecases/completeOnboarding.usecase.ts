/**
 * @file completeOnboarding.usecase.ts
 * @description Use case for completing onboarding
 */

import { OnboardingRepository } from '../../domain/repositories/onboarding.repository';
import { CreateNotificationUseCase } from '../../../notifications/application/usecases/createNotification.usecase';
import { NotificationType } from '../../../notifications/domain/entities/notification.entity';

export interface CompleteOnboardingInput {
  userId: string;
}

export class CompleteOnboardingUseCase {
  constructor(
    private onboardingRepository: OnboardingRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase
  ) {}
  
  async execute(input: CompleteOnboardingInput): Promise<void> {
    await this.onboardingRepository.completeOnboarding(input.userId);

    // Send system notification for profile completion (after onboarding is completed)
    await this.sendCompletionNotification(input.userId);
  }

  /**
   * Send system notification for onboarding completion
   * Self-notification is allowed for SYSTEM messages
   */
  private async sendCompletionNotification(userId: string): Promise<void> {
    try {
      // CreateNotificationUseCase handles:
      // - Database insertion
      // - FCM push sending (fire-and-forget)
      // Note: Self-notification check will be bypassed since actorId = userId for system messages
      await this.createNotificationUseCase.execute({
        userId: userId,
        actorId: userId, // System notification - actor is same as receiver
        type: NotificationType.SYSTEM,
        entityId: userId,
        title: 'Profile completed',
        body: 'Your profile setup is complete',
      });
    } catch (error) {
      // Fail silently - notifications should never break onboarding
      console.error('[CompleteOnboarding] Failed to send notification:', error);
    }
  }
}

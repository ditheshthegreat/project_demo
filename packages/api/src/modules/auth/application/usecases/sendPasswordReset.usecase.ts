/**
 * @file sendPasswordReset.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Send Password Reset Use Case - Generate password reset link
 */

import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';
import { BadRequestException } from '../../../../shared/core/exceptions/AppException';

export interface SendPasswordResetDTO {
  email: string;
}

export class SendPasswordResetUseCase {
  async execute(dto: SendPasswordResetDTO): Promise<string> {
    try {
      // Generate password reset link
      const resetLink = await firebaseAuth.generatePasswordResetLink(dto.email);
      
      // In production, you would send this via email service
      // For now, return the link
      return resetLink;
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate password reset link: ${error.message}`,
        'PASSWORD_RESET_ERROR'
      );
    }
  }
}

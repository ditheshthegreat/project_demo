/**
 * @file sendEmailVerification.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Send Email Verification Use Case - Generate email verification link
 */

import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';
import { BadRequestException } from '../../../../shared/core/exceptions/AppException';

export interface SendEmailVerificationDTO {
  email: string;
}

export class SendEmailVerificationUseCase {
  async execute(dto: SendEmailVerificationDTO): Promise<string> {
    try {
      // Generate email verification link
      const verificationLink = await firebaseAuth.generateEmailVerificationLink(dto.email);
      
      // In production, you would send this via email service
      // For now, return the link
      return verificationLink;
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate email verification link: ${error.message}`,
        'EMAIL_VERIFICATION_ERROR'
      );
    }
  }
}

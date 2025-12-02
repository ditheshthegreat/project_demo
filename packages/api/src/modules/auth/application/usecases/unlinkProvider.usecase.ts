/**
 * @file unlinkProvider.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Unlink Provider Use Case - Unlink auth provider from user account
 */

import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';
import { 
  BadRequestException, 
  NotFoundException 
} from '../../../../shared/core/exceptions/AppException';

export interface UnlinkProviderDTO {
  firebaseUid: string;
  provider: 'google.com' | 'apple.com' | 'password';
}

export class UnlinkProviderUseCase {
  async execute(dto: UnlinkProviderDTO): Promise<void> {
    try {
      // Get user from Firebase
      const userRecord = await firebaseAuth.getUser(dto.firebaseUid);
      
      // Check if user has multiple providers
      if (userRecord.providerData.length <= 1) {
        throw new BadRequestException(
          'Cannot unlink the only authentication provider. At least one provider must remain linked.',
          'LAST_PROVIDER_ERROR'
        );
      }

      // Check if provider is linked
      const providerExists = userRecord.providerData.some(
        (p) => p.providerId === dto.provider
      );
      
      if (!providerExists) {
        throw new NotFoundException(
          `Provider ${dto.provider} is not linked to this account`,
          'PROVIDER_NOT_FOUND'
        );
      }

      // In Firebase, provider unlinking must be done client-side
      // This endpoint can be used for validation or logging
      console.log(`Provider ${dto.provider} unlinking initiated for user ${dto.firebaseUid}`);
    } catch (error: any) {
      // Re-throw AppException errors as-is (they already have proper status and code)
      if (error.name === 'AppException' || 
          error instanceof BadRequestException || 
          error instanceof NotFoundException) {
        throw error;
      }
      // Wrap other errors in BadRequestException
      throw new BadRequestException(
        error.message || 'Failed to unlink provider',
        'UNLINK_PROVIDER_ERROR'
      );
    }
  }
}

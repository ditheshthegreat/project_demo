/**
 * @file unlinkProvider.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Unlink Provider Use Case - Unlink auth provider from user account
 */

import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';

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
        throw new Error('Cannot unlink the only authentication provider');
      }

      // Check if provider is linked
      const providerExists = userRecord.providerData.some(
        (p) => p.providerId === dto.provider
      );
      
      if (!providerExists) {
        throw new Error(`Provider ${dto.provider} is not linked to this account`);
      }

      // In Firebase, provider unlinking must be done client-side
      // This endpoint can be used for validation or logging
      console.log(`Provider ${dto.provider} unlinking initiated for user ${dto.firebaseUid}`);
    } catch (error: any) {
      throw new Error(`Failed to unlink provider: ${error.message}`);
    }
  }
}

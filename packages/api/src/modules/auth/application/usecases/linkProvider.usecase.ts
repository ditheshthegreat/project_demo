/**
 * @file linkProvider.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Link Provider Use Case - Link additional auth provider to user account
 */

import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';

export interface LinkProviderDTO {
  firebaseUid: string;
  provider: 'google.com' | 'apple.com' | 'password';
  providerId?: string;
}

export class LinkProviderUseCase {
  async execute(dto: LinkProviderDTO): Promise<void> {
    try {
      // Note: Provider linking is typically done on the client side (Flutter)
      // This is a placeholder for server-side provider management
      
      // Get user from Firebase
      const userRecord = await firebaseAuth.getUser(dto.firebaseUid);
      
      // Check if provider already linked
      const providerExists = userRecord.providerData.some(
        (p) => p.providerId === dto.provider
      );
      
      if (providerExists) {
        throw new Error(`Provider ${dto.provider} is already linked to this account`);
      }

      // In Firebase, provider linking must be done client-side
      // This endpoint can be used for validation or logging
      console.log(`Provider ${dto.provider} linking initiated for user ${dto.firebaseUid}`);
    } catch (error: any) {
      throw new Error(`Failed to link provider: ${error.message}`);
    }
  }
}

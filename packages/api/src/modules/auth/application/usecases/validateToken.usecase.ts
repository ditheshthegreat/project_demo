/**
 * @file validateToken.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Validate Token Use Case - Token introspection for internal services
 */

import { firebaseAuth } from '../../../../shared/infra/firebase/firebaseClient';

export interface ValidateTokenDTO {
  token: string;
}

export interface TokenValidationResult {
  valid: boolean;
  expired: boolean;
  revoked: boolean;
  payload?: any;
  error?: string;
}

export class ValidateTokenUseCase {
  async execute(dto: ValidateTokenDTO): Promise<TokenValidationResult> {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(dto.token, true);

      return {
        valid: true,
        expired: false,
        revoked: false,
        payload: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          emailVerified: decodedToken.email_verified,
          issuedAt: new Date(decodedToken.iat * 1000),
          expiresAt: new Date(decodedToken.exp * 1000),
        },
      };
    } catch (error: any) {
      // Check error types
      if (error.code === 'auth/id-token-expired') {
        return {
          valid: false,
          expired: true,
          revoked: false,
          error: 'Token has expired',
        };
      }

      if (error.code === 'auth/id-token-revoked') {
        return {
          valid: false,
          expired: false,
          revoked: true,
          error: 'Token has been revoked',
        };
      }

      return {
        valid: false,
        expired: false,
        revoked: false,
        error: error.message || 'Invalid token',
      };
    }
  }
}

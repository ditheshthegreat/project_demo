/**
 * @file auth.controller.ts
 * @module Auth/Interfaces/Controllers
 * @layer Interface
 * @description Auth Controller - Complete HTTP Request Handlers for Firebase Auth
 */

import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../shared/middleware/verifyAuth.middleware";
import { VerifyUserUseCase } from "../../application/usecases/verifyUser.usecase";
import { GetUserUseCase } from "../../application/usecases/getUser.usecase";
import { UpdateUserUseCase } from "../../application/usecases/updateUser.usecase";
import { DeleteUserUseCase } from "../../application/usecases/deleteUser.usecase";
import { GetRoleUseCase } from "../../application/usecases/getRole.usecase";
import { ValidateTokenUseCase } from "../../application/usecases/validateToken.usecase";
import { SendPasswordResetUseCase } from "../../application/usecases/sendPasswordReset.usecase";
import { SendEmailVerificationUseCase } from "../../application/usecases/sendEmailVerification.usecase";
import { LinkProviderUseCase } from "../../application/usecases/linkProvider.usecase";
import { UnlinkProviderUseCase } from "../../application/usecases/unlinkProvider.usecase";
import axios from "axios";

export class AuthController {
  constructor(
    private readonly verifyUserUseCase: VerifyUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly sendPasswordResetUseCase: SendPasswordResetUseCase,
    private readonly sendEmailVerificationUseCase: SendEmailVerificationUseCase,
    private readonly linkProviderUseCase: LinkProviderUseCase,
    private readonly unlinkProviderUseCase: UnlinkProviderUseCase
  ) {}

  /**
   * GET /auth/verify
   * Verify Firebase token and sync user profile
   */
  verify = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Firebase user data not found",
        });
        return;
      }

      const user = await this.verifyUserUseCase.execute({
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
      });

      res.status(200).json({
        success: true,
        data: { user: user.toJSON() },
        message: "User verified successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/me
   * Get authenticated user's profile
   */
  getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await this.getUserUseCase.execute({
        firebaseUid: req.user.uid,
      });

      res.status(200).json({
        success: true,
        data: { user: user.toJSON() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /auth/me
   * Update user profile
   */
  updateMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await this.updateUserUseCase.execute({
        firebaseUid: req.user.uid,
        ...req.body,
      });

      res.status(200).json({
        success: true,
        data: { user: user.toJSON() },
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /auth/delete
   * Soft delete user account
   */
  deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const hardDelete = req.body.hardDelete === true;

      await this.deleteUserUseCase.execute({
        firebaseUid: req.user.uid,
        hardDelete,
      });

      res.status(200).json({
        success: true,
        message: hardDelete 
          ? "Account permanently deleted"
          : "Account deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/role
   * Get user roles
   */
  getRoles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // First get user to get their DB ID
      const user = await this.getUserUseCase.execute({
        firebaseUid: req.user.uid,
      });

      const roles = await this.getRoleUseCase.execute({
        userId: user.id,
      });

      res.status(200).json({
        success: true,
        data: {
          roles: roles.map((r) => r.name),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/validate
   * Token introspection endpoint
   */
  validateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: "Token is required",
        });
        return;
      }

      const result = await this.validateTokenUseCase.execute({ token });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/signout
   * Sign out user and revoke refresh tokens
   */
  signout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Firebase user data not found",
        });
        return;
      }

      const { firebaseAuth } = await import("../../../../shared/infra/firebase/firebaseClient");
      await firebaseAuth.revokeRefreshTokens(req.user.uid);

      res.status(200).json({
        success: true,
        message: "User signed out successfully. Refresh tokens revoked.",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/resetPassword
   * Generate password reset link
   */
  resetPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      const resetLink = await this.sendPasswordResetUseCase.execute({ email });

      res.status(200).json({
        success: true,
        data: { resetLink },
        message: "Password reset link generated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/sendVerification
   * Generate email verification link
   */
  sendVerification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      const verificationLink = await this.sendEmailVerificationUseCase.execute({ email });

      res.status(200).json({
        success: true,
        data: { verificationLink },
        message: "Email verification link generated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/linkProvider
   * Link additional auth provider
   */
  linkProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { provider, providerId } = req.body;

      if (!provider) {
        res.status(400).json({
          success: false,
          message: "Provider is required",
        });
        return;
      }

      await this.linkProviderUseCase.execute({
        firebaseUid: req.user.uid,
        provider,
        providerId,
      });

      res.status(200).json({
        success: true,
        message: `Provider ${provider} linked successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/unlinkProvider
   * Unlink auth provider
   */
  unlinkProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { provider } = req.body;

      if (!provider) {
        res.status(400).json({
          success: false,
          message: "Provider is required",
        });
        return;
      }

      await this.unlinkProviderUseCase.execute({
        firebaseUid: req.user.uid,
        provider,
      });

      res.status(200).json({
        success: true,
        message: `Provider ${provider} unlinked successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/dev/login
   * DEVELOPMENT ONLY: Get Firebase token via email/password
   * DO NOT USE IN PRODUCTION
   */
  devLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'production') {
        res.status(403).json({
          success: false,
          message: "This endpoint is only available in development mode",
        });
        return;
      }

      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const apiKey = process.env.FIREBASE_WEB_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          success: false,
          message: "Firebase Web API Key not configured",
        });
        return;
      }

      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      );

      res.status(200).json({
        success: true,
        data: {
          idToken: response.data.idToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
          localId: response.data.localId,
          email: response.data.email,
        },
        message: "Login successful - use idToken as Bearer token",
      });
    } catch (error: any) {
      if (error.response?.data) {
        res.status(401).json({
          success: false,
          message: error.response.data.error?.message || "Authentication failed",
        });
      } else {
        next(error);
      }
    }
  };
}

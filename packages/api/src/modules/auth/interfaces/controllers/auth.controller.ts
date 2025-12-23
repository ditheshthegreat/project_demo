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
import { firebaseAuth } from "../../../../shared/infra/firebase/firebaseClient";
import { prisma } from "../../../../shared/infra/prisma/prismaClient";
import { s3Service } from "../../../../shared/infra/storage/s3.service";
import { PushTokenRepositoryImpl } from "../../../notifications/infrastructure/database/pushToken.repository.impl";
import { RegisterPushTokenUseCase } from "../../../notifications/application/usecases/registerPushToken.usecase";
import { RemovePushTokenUseCase } from "../../../notifications/application/usecases/removePushToken.usecase";
import { DeviceType } from "../../../notifications/domain/entities/pushToken.entity";

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
   * POST /auth/verify
   * Verify Firebase token and sync user profile
   * Optionally register FCM push token
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

      // Optionally register FCM push token if provided
      const { fcmToken, deviceType, deviceId } = req.body || {};
      if (fcmToken && deviceType) {
        try {
          const pushTokenRepository = new PushTokenRepositoryImpl();
          const registerPushTokenUseCase = new RegisterPushTokenUseCase(pushTokenRepository);
          
          await registerPushTokenUseCase.execute({
            userId: user.id,
            token: fcmToken,
            deviceType: deviceType as DeviceType,
            deviceId,
          });
        } catch (error) {
          // Log error but don't fail the verify request
          console.error('Failed to register push token:', error);
        }
      }

      const userJson = user.toJSON();
      
      // Generate signed URL if profileImage exists
      if (userJson.profileImage) {
        try {
          userJson.profileImage = await s3Service.getSignedUrl(userJson.profileImage);
        } catch (error) {
          // If S3 key is invalid or doesn't exist, set to null
          userJson.profileImage = null;
        }
      }

      res.status(200).json({
        success: true,
        data: { user: userJson },
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

      const userJson = user.toJSON();
      
      // Generate signed URL if profileImage exists
      if (userJson.profileImage) {
        try {
          userJson.profileImage = await s3Service.getSignedUrl(userJson.profileImage);
        } catch (error) {
          // If S3 key is invalid or doesn't exist, set to null
          userJson.profileImage = null;
        }
      }

      res.status(200).json({
        success: true,
        data: { user: userJson },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /auth/me
   * Update user profile with optional image upload
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

      let profileImageKey: string | undefined;

      // Handle profile image upload if file is present
      if (req.file) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = req.file.originalname.split('.').pop() || 'jpg';
        profileImageKey = `profiles/${timestamp}-${randomString}.${extension}`;

        // Upload to S3 with custom key for profiles
        const { PutObjectCommand } = await import('@aws-sdk/client-s3');
        const { getS3Client } = await import('../../../../shared/infra/storage/s3.client');
        const { getS3Config } = await import('../../../../shared/infra/storage/s3.config');

        const client = getS3Client();
        const config = getS3Config();

        const command = new PutObjectCommand({
          Bucket: config.bucket,
          Key: profileImageKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        });

        await client.send(command);

        // Delete old profile image if it exists
        const currentUser = await this.getUserUseCase.execute({
          firebaseUid: req.user.uid,
        });
        const currentUserJson = currentUser.toJSON();
        if (currentUserJson.profileImage) {
          try {
            await s3Service.deleteFile(currentUserJson.profileImage);
          } catch (error) {
            // Ignore deletion errors for old images
          }
        }
      }

      // Parse multipart form data fields
      const updateData: any = {
        firebaseUid: req.user.uid,
      };

      // Add text fields if present
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.gender) updateData.gender = req.body.gender;

      // Parse age as integer
      if (req.body.age) {
        const ageValue = parseInt(req.body.age, 10);
        if (!isNaN(ageValue)) {
          updateData.age = ageValue;
        }
      }

      // Parse JSON fields
      if (req.body.location) {
        try {
          updateData.location = typeof req.body.location === 'string' 
            ? JSON.parse(req.body.location) 
            : req.body.location;
        } catch (error) {
          // Invalid JSON, skip
        }
      }

      if (req.body.accessibility) {
        try {
          updateData.accessibility = typeof req.body.accessibility === 'string'
            ? JSON.parse(req.body.accessibility)
            : req.body.accessibility;
        } catch (error) {
          // Invalid JSON, skip
        }
      }

      if (req.body.preferences) {
        try {
          updateData.preferences = typeof req.body.preferences === 'string'
            ? JSON.parse(req.body.preferences)
            : req.body.preferences;
        } catch (error) {
          // Invalid JSON, skip
        }
      }

      // Add profile image key if uploaded
      if (profileImageKey) {
        updateData.profileImage = profileImageKey;
      }

      const user = await this.updateUserUseCase.execute(updateData);

      const userJson = user.toJSON();
      
      // Generate signed URL if profileImage exists
      if (userJson.profileImage) {
        try {
          userJson.profileImage = await s3Service.getSignedUrl(userJson.profileImage);
        } catch (error) {
          // If S3 key is invalid or doesn't exist, set to null
          userJson.profileImage = null;
        }
      }

      res.status(200).json({
        success: true,
        data: { user: userJson },
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
   * Optionally remove device-specific FCM token
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

      const { fcmToken } = req.body || {};

      // Remove device-specific FCM token if provided
      if (fcmToken) {
        try {
          const user = await this.getUserUseCase.execute({
            firebaseUid: req.user.uid,
          });

          const pushTokenRepository = new PushTokenRepositoryImpl();
          const removePushTokenUseCase = new RemovePushTokenUseCase(pushTokenRepository);
          
          await removePushTokenUseCase.execute({
            token: fcmToken,
            userId: user.id,
          });
        } catch (error) {
          console.error('Failed to remove push token on signout:', error);
        }
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
   * POST /auth/dev/signup
   * Development-only signup endpoint - Create Firebase user and database record
   */
  devSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only allow in development
      if (process.env.NODE_ENV === "production") {
        res.status(403).json({
          success: false,
          message: "This endpoint is disabled in production",
        });
        return;
      }

      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      // Create Firebase user
      const firebaseUser = await firebaseAuth.createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
      });

      // Create database user using verifyUser logic
      let dbUser = await this.verifyUserUseCase.execute({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || name,
      });

      // Enable profile visibility for dev users (direct DB update)
      await prisma.user.update({
        where: { firebaseUid: firebaseUser.uid },
        data: {
          publicProfile: true,
          onboardingCompleted: true,
        },
      });

      // Refresh user data
      dbUser = await this.getUserUseCase.execute({
        firebaseUid: firebaseUser.uid,
      });

      // Use Firebase REST API to get tokens
      const apiKey = process.env.FIREBASE_WEB_API_KEY || "AIzaSyDY0xxxxxxxxxxxxxxxxxxx";
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

      const response = await axios.post(url, {
        email,
        password,
        returnSecureToken: true,
      });

      res.status(201).json({
        success: true,
        data: {
          user: dbUser.toJSON(),
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          idToken: response.data.idToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
        },
        message: "User created successfully in Firebase and database - use idToken as Bearer token",
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        res.status(409).json({
          success: false,
          message: "Email already exists",
        });
        return;
      }
      if (error.code === 'auth/invalid-email') {
        res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
        return;
      }
      if (error.code === 'auth/weak-password') {
        res.status(400).json({
          success: false,
          message: "Password is too weak (minimum 6 characters)",
        });
        return;
      }
      next(error);
    }
  };

  /**
   * POST /auth/dev/login
   * Development-only login endpoint
   */
  devLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only allow in development
      if (process.env.NODE_ENV === "production") {
        res.status(403).json({
          success: false,
          message: "This endpoint is disabled in production",
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

      // Use Firebase REST API to sign in
      const apiKey = process.env.FIREBASE_WEB_API_KEY || "AIzaSyDY0xxxxxxxxxxxxxxxxxxx";
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

      const response = await axios.post(url, {
        email,
        password,
        returnSecureToken: true,
      });

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
      if (error.response?.data?.error?.message) {
        res.status(401).json({
          success: false,
          message: error.response.data.error.message,
        });
        return;
      }
      next(error);
    }
  };
}

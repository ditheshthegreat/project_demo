/**
 * @file auth.module.ts
 * @module Auth
 * @layer Module
 * @description Auth Module - Dependency Injection Container
 * 
 * Assembles all components of the Auth module using dependency injection.
 * Follows Clean Architecture by wiring together layers without coupling them.
 * 
 * **Architecture Layers:**
 * 1. Infrastructure: UserRepository implementation
 * 2. Application: VerifyUserUseCase for business logic
 * 3. Interface: AuthController and AuthRoutes for HTTP
 * 
 * **Firebase Integration:**
 * - No JWT/password providers needed
 * - Firebase Admin SDK handles token verification
 * - Only user profile sync required
 * 
 * @example
 * import { authRouter } from './modules/auth/auth.module';
 * app.use('/api/auth', authRouter);
 */

import { Router } from "express";
import { UserRepositoryImpl } from "./infrastructure/database/userRepositoryImpl";
import { RoleRepositoryImpl } from "./infrastructure/database/roleRepositoryImpl";
import { VerifyUserUseCase } from "./application/usecases/verifyUser.usecase";
import { GetUserUseCase } from "./application/usecases/getUser.usecase";
import { UpdateUserUseCase } from "./application/usecases/updateUser.usecase";
import { DeleteUserUseCase } from "./application/usecases/deleteUser.usecase";
import { GetRoleUseCase } from "./application/usecases/getRole.usecase";
import { ValidateTokenUseCase } from "./application/usecases/validateToken.usecase";
import { SendPasswordResetUseCase } from "./application/usecases/sendPasswordReset.usecase";
import { SendEmailVerificationUseCase } from "./application/usecases/sendEmailVerification.usecase";
import { LinkProviderUseCase } from "./application/usecases/linkProvider.usecase";
import { UnlinkProviderUseCase } from "./application/usecases/unlinkProvider.usecase";
import { AuthController } from "./interfaces/controllers/auth.controller";
import { AuthRoutes } from "./interfaces/routes/auth.routes";

/**
 * Auth Module
 * 
 * Dependency injection container for authentication.
 * Complete Firebase authentication with all features.
 */
export class AuthModule {
  private router: Router;

  constructor() {
    // Infrastructure layer: Repositories
    const userRepository = new UserRepositoryImpl();
    const roleRepository = new RoleRepositoryImpl();

    // Application layer: All use cases
    const verifyUserUseCase = new VerifyUserUseCase(userRepository);
    const getUserUseCase = new GetUserUseCase(userRepository);
    const updateUserUseCase = new UpdateUserUseCase(userRepository);
    const deleteUserUseCase = new DeleteUserUseCase(userRepository);
    const getRoleUseCase = new GetRoleUseCase(roleRepository);
    const validateTokenUseCase = new ValidateTokenUseCase();
    const sendPasswordResetUseCase = new SendPasswordResetUseCase();
    const sendEmailVerificationUseCase = new SendEmailVerificationUseCase();
    const linkProviderUseCase = new LinkProviderUseCase();
    const unlinkProviderUseCase = new UnlinkProviderUseCase();

    // Interface layer: HTTP controller and routes
    const authController = new AuthController(
      verifyUserUseCase,
      getUserUseCase,
      updateUserUseCase,
      deleteUserUseCase,
      getRoleUseCase,
      validateTokenUseCase,
      sendPasswordResetUseCase,
      sendEmailVerificationUseCase,
      linkProviderUseCase,
      unlinkProviderUseCase
    );
    const authRoutes = new AuthRoutes(authController);

    this.router = authRoutes.getRouter();
  }

  /**
   * Get Express router with auth routes
   * 
   * @returns {Router} Express router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Get user repository for other modules
   * 
   * @returns {UserRepositoryImpl} User repository instance
   */
  getUserRepository(): UserRepositoryImpl {
    return new UserRepositoryImpl();
  }
}

/**
 * Singleton instance of Auth Module
 * 
 * Export router for use in main application.
 */
const authModuleInstance = new AuthModule();
export const authRouter = authModuleInstance.getRouter();

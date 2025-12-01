/**
 * @file onboarding.module.ts
 * @module Onboarding
 * @layer Module
 * @description Onboarding Module - Dependency Injection Container
 * 
 * Assembles all components of the Onboarding module using dependency injection.
 * Follows Clean Architecture by wiring together layers without coupling them.
 * 
 * **Architecture Layers:**
 * 1. Infrastructure: OnboardingRepository implementation
 * 2. Application: Use cases for each onboarding step
 * 3. Interface: OnboardingController and OnboardingRoutes for HTTP
 * 
 * @example
 * import { onboardingRouter } from './modules/onboarding/onboarding.module';
 * app.use('/api/onboarding', onboardingRouter);
 */

import { Router } from 'express';
import { OnboardingController } from './interfaces/controllers/onboarding.controller';
import { OnboardingRoutes } from './interfaces/routes/onboarding.routes';

/**
 * Onboarding Module
 * 
 * Dependency injection container for onboarding functionality.
 * Complete 6-step onboarding process with all features.
 * 
 * Note: The controller instantiates its own use cases and repository internally.
 */
export class OnboardingModule {
  private router: Router;

  constructor() {
    // Interface layer: HTTP controller and routes
    // Controller manages its own dependencies (repository and use cases)
    const onboardingController = new OnboardingController();
    const onboardingRoutes = new OnboardingRoutes(onboardingController);

    this.router = onboardingRoutes.getRouter();
  }

  /**
   * Get Express router with onboarding routes
   * 
   * @returns {Router} Express router
   */
  getRouter(): Router {
    return this.router;
  }
}

/**
 * Singleton instance of Onboarding Module
 * 
 * Export router for use in main application.
 */
const onboardingModuleInstance = new OnboardingModule();
export const onboardingRouter = onboardingModuleInstance.getRouter();

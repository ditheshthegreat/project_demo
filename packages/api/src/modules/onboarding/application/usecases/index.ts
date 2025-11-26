/**
 * @file index.ts
 * @description Barrel export for all onboarding usecases
 */

export * from './step1BasicInfo.usecase';
export * from './allUsecases';

// Re-export Step2LocationUseCase for compatibility
export { Step2LocationUseCase } from './allUsecases';

/**
 * @file jest.config.ts
 * @description Jest configuration for API tests
 * 
 * Test Types:
 * - Live Tests: Use real Firebase authentication (LIVE_TEST=true)
 * - Unit Tests: Mock Firebase if needed in individual test files
 * 
 * Environment Setup:
 * - setupFiles: Loads .env.test before any tests (jest.setup.js)
 * - setupFilesAfterEnv: Database setup and cleanup (setup.ts)
 * 
 * Required .env.test variables for live tests:
 * - LIVE_TEST=true
 * - TEST_USER_EMAIL=ajith@inklusio.com
 * - TEST_USER_PASSWORD=Ajith@123
 * - FIREBASE_WEB_API_KEY=AIzaSyADu24ibhQOd8ztWwi6qP5Se76BfdDfHns
 * - FIREBASE_AUTH_DOMAIN=inklusio-55bce.firebaseapp.com
 */

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/app/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Load environment variables before test framework
  setupFiles: ['<rootDir>/tests/jest.setup.js'],
  // Database connection and cleanup after test framework
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;

/**
 * @file setup.ts
 * @description Global test setup for all Jest tests
 * 
 * Firebase Admin SDK is mocked in tests/jest.setup.js (runs before this file)
 */

import dotenv from 'dotenv';
import path from 'path';

// IMPORTANT: Load test environment variables FIRST, before any other imports
// This ensures Prisma Client connects to the test database
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test'), override: true });

import { prisma } from '../src/shared/infra/prisma/prismaClient';

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterEach(async () => {
  // Skip cleanup for live integration tests (they manage their own data)
  if (process.env.LIVE_TEST === 'true') {
    return;
  }
  
  // Skip cleanup for onboarding tests (they manage their own data with beforeEach)
  // Onboarding tests reset user data in their own beforeEach hook
  const testName = expect.getState().currentTestName || '';
  if (testName.includes('Onboarding Module')) {
    return;
  }
  
  // Clean up database between tests for other test suites
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Disconnect from test database
  await prisma.$disconnect();
});

// Increase timeout for database operations
jest.setTimeout(30000);

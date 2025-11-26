/**
 * @file jest.setup.js
 * @description Jest setup that runs BEFORE test framework initialization
 * 
 * This file runs before TypeScript compilation and test framework initialization.
 * 
 * IMPORTANT: Firebase Admin SDK is NOT mocked here.
 * - Auth module tests use REAL Firebase (LIVE_TEST=true)
 * - Individual test files can mock Firebase if needed
 * 
 * Environment Variables from .env.test:
 * - LIVE_TEST=true - Use real Firebase authentication
 * - TEST_USER_EMAIL - Email for test user (ajith@inklusio.com)
 * - TEST_USER_PASSWORD - Password for test user
 * - FIREBASE_WEB_API_KEY - Firebase web API key
 * - FIREBASE_AUTH_DOMAIN - Firebase auth domain
 */

const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables FIRST
dotenv.config({ 
  path: path.resolve(__dirname, '../../../.env.test'),
  override: true 
});

// No global mocks here - let individual test files control their mocking
// This allows auth module to use real Firebase while other modules can mock if needed

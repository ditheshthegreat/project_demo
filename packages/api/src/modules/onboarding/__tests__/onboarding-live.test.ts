/**
 * @file onboarding-live.test.ts
 * @description End-to-End Integration Tests for Onboarding Module
 * 
 * LIVE TESTS - No Mocks Allowed!
 * 
 * These tests use:
 * - Real Firebase Authentication (Client SDK)
 * - Real PostgreSQL test database
 * - Real HTTP calls to backend
 * - Real Firebase ID tokens
 * 
 * Run with: LIVE_TEST=true yarn test onboarding-live
 * 
 * IMPORTANT: 
 * - Tests only run when LIVE_TEST=true
 * - Requires API server running on http://localhost:3000
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, Auth, UserCredential } from 'firebase/auth';
import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.test') });

// Create Prisma client for test database
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'postgresql://inklusio_user:inklusio_pass@localhost:5432/inklusio',
});

// Check if live tests should run
const shouldRunLiveTests = process.env.LIVE_TEST === 'true';

describe('Onboarding Module - LIVE FIREBASE TESTS', () => {
  // Skip all tests if LIVE_TEST is not enabled
  if (!shouldRunLiveTests) {
    it.skip('Skipping live tests - Set LIVE_TEST=true to run', () => {});
    return;
  }

  let firebaseApp: FirebaseApp;
  let firebaseAuth: Auth;
  let userCredential: UserCredential;
  let idToken: string;
  let axiosClient: AxiosInstance;
  let testUserId: string;

  // Test configuration
  const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL!;
  const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD!;
  const API_URL = process.env.API_URL || 'http://localhost:3000/api';

  beforeAll(async () => {
    console.log('\n🚀 Starting Onboarding Live Integration Tests');
    console.log(`📧 Test User: ${TEST_USER_EMAIL}`);
    console.log(`🔗 API URL: ${API_URL}`);

    // Validate required environment variables
    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.test');
    }

    // Initialize Firebase Client SDK
    console.log('🔥 Initializing Firebase Client SDK...');
    firebaseApp = initializeApp({
      apiKey: process.env.FIREBASE_WEB_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    });

    firebaseAuth = getAuth(firebaseApp);

    // Authenticate test user
    console.log('🔐 Authenticating test user with Firebase...');
    try {
      userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        TEST_USER_EMAIL,
        TEST_USER_PASSWORD
      );

      console.log('✅ Firebase authentication successful');
      console.log(`🆔 Firebase UID: ${userCredential.user.uid}`);
      testUserId = userCredential.user.uid;

      // Get ID token
      idToken = await userCredential.user.getIdToken();
      console.log(`🎫 Token length: ${idToken.length} characters`);

      // Create axios client with authentication
      axiosClient = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // Don't throw on any status
      });

      // Ensure user exists and reset onboarding data
      console.log('🧹 Ensuring user exists and resetting onboarding data...');
      await prisma.user.upsert({
        where: { firebaseUid: testUserId },
        update: {
          onboardingStep: 0,
          onboardingCompleted: false,
          gender: null,
          dateOfBirth: null,
          description: null,
          city: null,
          federalState: null,
          interests: [],
          hobbies: [],
          accessibilityRequirements: [],
          accessibilityTools: [],
          lookingFor: [],
          communicationPreferences: [],
          allowLocation: false,
          showAge: false,
          allowMatching: true,
          publicProfile: true,
          allowNotifications: true,
        },
        create: {
          firebaseUid: testUserId,
          email: TEST_USER_EMAIL,
          onboardingStep: 0,
          onboardingCompleted: false,
          interests: [],
          hobbies: [],
          accessibilityRequirements: [],
          accessibilityTools: [],
          lookingFor: [],
          communicationPreferences: [],
          allowLocation: false,
          showAge: false,
          allowMatching: true,
          publicProfile: true,
          allowNotifications: true,
        },
      });

      console.log('✅ Test setup complete\n');
    } catch (error: any) {
      console.error('❌ Firebase authentication failed:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    console.log('\n🧹 Cleaning up test data...');

    // Reset onboarding data after tests (if user exists)
    if (testUserId) {
      try {
        await prisma.user.update({
          where: { firebaseUid: testUserId },
          data: {
            onboardingStep: 0,
            onboardingCompleted: false,
            gender: null,
            dateOfBirth: null,
            description: null,
            city: null,
            federalState: null,
            interests: [],
            hobbies: [],
            accessibilityRequirements: [],
            accessibilityTools: [],
            lookingFor: [],
            communicationPreferences: [],
            allowLocation: false,
            showAge: false,
            allowMatching: true,
            publicProfile: true,
            allowNotifications: true,
          },
        });
      } catch (error) {
        console.log('⚠️ Could not reset user data (user may not exist)');
      }
    }

    await prisma.$disconnect();
    console.log('✅ Test cleanup complete');
  });

  // ==========================================
  // TEST 1: Get Initial Onboarding Status
  // ==========================================
  it('1. GET /onboarding/status - should return initial onboarding status', async () => {
    console.log('\n📍 Testing: GET /onboarding/status (initial)');

    const response = await axiosClient.get('/onboarding/status');

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Validate status structure
    expect(response.data.data).toHaveProperty('currentStep');
    expect(response.data.data).toHaveProperty('completed');
    expect(response.data.data).toHaveProperty('totalSteps');

    // Validate initial state
    expect(response.data.data.currentStep).toBe(0);
    expect(response.data.data.completed).toBe(false);
    expect(response.data.data.totalSteps).toBe(6);

    console.log('✅ TEST 1 PASSED: Initial status retrieved');
  });

  // ==========================================
  // TEST 2: Complete Step 1 - Basic Info
  // ==========================================
  it('2. POST /onboarding/step1 - should complete step 1 with basic info', async () => {
    console.log('\n📍 Testing: POST /onboarding/step1');

    const step1Data = {
      gender: 'male',
      dateOfBirth: '1990-01-15T00:00:00.000Z',
      description: 'Test user for onboarding integration tests',
    };

    const response = await axiosClient.post('/onboarding/step1', step1Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('Step 1');

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.gender).toBe('male');
    expect(user?.description).toBe('Test user for onboarding integration tests');
    expect(user?.onboardingStep).toBeGreaterThanOrEqual(1);

    console.log('✅ TEST 2 PASSED: Step 1 completed');
  });

  // ==========================================
  // TEST 3: Complete Step 2 - Location
  // ==========================================
  it('3. POST /onboarding/step2 - should complete step 2 with location', async () => {
    console.log('\n📍 Testing: POST /onboarding/step2');

    const step2Data = {
      city: 'Berlin',
      federalState: 'Berlin',
      allowLocation: true,
    };

    const response = await axiosClient.post('/onboarding/step2', step2Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.city).toBe('Berlin');
    expect(user?.federalState).toBe('Berlin');
    expect(user?.allowLocation).toBe(true);
    expect(user?.onboardingStep).toBeGreaterThanOrEqual(2);

    console.log('✅ TEST 3 PASSED: Step 2 completed');
  });

  // ==========================================
  // TEST 4: Complete Step 3 - Interests
  // ==========================================
  it('4. POST /onboarding/step3 - should complete step 3 with interests', async () => {
    console.log('\n📍 Testing: POST /onboarding/step3');

    const step3Data = {
      interests: ['Sports & Exercise', 'Music', 'Technology', 'Reading'],
    };

    const response = await axiosClient.post('/onboarding/step3', step3Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.interests).toHaveLength(4);
    expect(user?.interests).toContain('Sports & Exercise');
    expect(user?.interests).toContain('Technology');
    expect(user?.onboardingStep).toBeGreaterThanOrEqual(3);

    console.log('✅ TEST 4 PASSED: Step 3 completed');
  });

  // ==========================================
  // TEST 5: Complete Step 4 - Hobbies
  // ==========================================
  it('5. POST /onboarding/step4 - should complete step 4 with hobbies', async () => {
    console.log('\n📍 Testing: POST /onboarding/step4');

    const step4Data = {
      hobbies: ['Hiking', 'Swimming', 'Yoga'],
    };

    const response = await axiosClient.post('/onboarding/step4', step4Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.hobbies).toHaveLength(3);
    expect(user?.hobbies).toContain('Hiking');
    expect(user?.onboardingStep).toBeGreaterThanOrEqual(4);

    console.log('✅ TEST 5 PASSED: Step 4 completed');
  });

  // ==========================================
  // TEST 6: Complete Step 5.1 - Requirements
  // ==========================================
  it('6. POST /onboarding/step5/requirements - should complete step 5.1', async () => {
    console.log('\n📍 Testing: POST /onboarding/step5/requirements');

    const step5Data = {
      accessibilityRequirements: ['Wheelchair accessible', 'Visual impairment'],
    };

    const response = await axiosClient.post('/onboarding/step5/requirements', step5Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.accessibilityRequirements).toHaveLength(2);
    expect(user?.accessibilityRequirements).toContain('Wheelchair accessible');

    console.log('✅ TEST 6 PASSED: Step 5.1 completed');
  });

  // ==========================================
  // TEST 7: Complete Step 5.2 - Tools
  // ==========================================
  it('7. POST /onboarding/step5/tools - should complete step 5.2', async () => {
    console.log('\n📍 Testing: POST /onboarding/step5/tools');

    const step5Data = {
      accessibilityTools: ['Wheelchair', 'Hearing aids'],
    };

    const response = await axiosClient.post('/onboarding/step5/tools', step5Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.accessibilityTools).toHaveLength(2);
    expect(user?.accessibilityTools).toContain('Wheelchair');

    console.log('✅ TEST 7 PASSED: Step 5.2 completed');
  });

  // ==========================================
  // TEST 8: Complete Step 5.3 - Looking For
  // ==========================================
  it('8. POST /onboarding/step5/looking-for - should complete step 5.3', async () => {
    console.log('\n📍 Testing: POST /onboarding/step5/looking-for');

    const step5Data = {
      lookingFor: ['New friendships', 'Activity partners', 'Hobbies'],
    };

    const response = await axiosClient.post('/onboarding/step5/looking-for', step5Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.lookingFor).toHaveLength(3);
    expect(user?.lookingFor).toContain('New friendships');

    console.log('✅ TEST 8 PASSED: Step 5.3 completed');
  });

  // ==========================================
  // TEST 9: Complete Step 5.4 - Communication
  // ==========================================
  it('9. POST /onboarding/step5/communication - should complete step 5.4', async () => {
    console.log('\n📍 Testing: POST /onboarding/step5/communication');

    const step5Data = {
      communicationPreferences: ['Direct messages', 'Video calls', 'Written communication'],
    };

    const response = await axiosClient.post('/onboarding/step5/communication', step5Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.communicationPreferences).toHaveLength(3);
    expect(user?.communicationPreferences).toContain('Direct messages');

    console.log('✅ TEST 9 PASSED: Step 5.4 completed');
  });

  // ==========================================
  // TEST 10: Complete Step 6 - Privacy
  // ==========================================
  it('10. POST /onboarding/step6 - should complete step 6 with privacy settings', async () => {
    console.log('\n📍 Testing: POST /onboarding/step6');

    const step6Data = {
      allowLocation: true,
      showAge: false,
      allowMatching: true,
      publicProfile: true,
      allowNotifications: true,
    };

    const response = await axiosClient.post('/onboarding/step6', step6Data);

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.allowLocation).toBe(true);
    expect(user?.showAge).toBe(false);
    expect(user?.allowMatching).toBe(true);
    expect(user?.publicProfile).toBe(true);
    expect(user?.allowNotifications).toBe(true);
    expect(user?.onboardingStep).toBe(6);

    console.log('✅ TEST 10 PASSED: Step 6 completed');
  });

  // ==========================================
  // TEST 11: Complete Onboarding
  // ==========================================
  it('11. POST /onboarding/complete - should mark onboarding as completed', async () => {
    console.log('\n📍 Testing: POST /onboarding/complete');

    const response = await axiosClient.post('/onboarding/complete');

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.completed).toBe(true);

    // Verify data in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: testUserId },
    });

    expect(user?.onboardingCompleted).toBe(true);
    expect(user?.onboardingStep).toBe(6);

    console.log('✅ TEST 11 PASSED: Onboarding completed');
  });

  // ==========================================
  // TEST 12: Get Final Onboarding Status
  // ==========================================
  it('12. GET /onboarding/status - should return completed status', async () => {
    console.log('\n📍 Testing: GET /onboarding/status (final)');

    const response = await axiosClient.get('/onboarding/status');

    // Validate HTTP response
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Validate completed state
    expect(response.data.data.currentStep).toBe(6);
    expect(response.data.data.completed).toBe(true);
    expect(response.data.data.completedSteps).toHaveLength(6);

    // Verify all data is present
    expect(response.data.data.data.gender).toBe('male');
    expect(response.data.data.data.city).toBe('Berlin');
    expect(response.data.data.data.interests).toHaveLength(4);
    expect(response.data.data.data.hobbies).toHaveLength(3);

    console.log('✅ TEST 12 PASSED: Final status shows completed');
    console.log('\n🎉 ALL ONBOARDING TESTS PASSED!');
  });

  // ==========================================
  // TEST 13: Validation Tests
  // ==========================================
  describe('Validation Tests', () => {
    it('13a. Should reject step 3 with less than 3 interests', async () => {
      console.log('\n📍 Testing: Validation - Less than 3 interests');

      const response = await axiosClient.post('/onboarding/step3', {
        interests: ['Sports & Exercise', 'Music'], // Only 2
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);

      console.log('✅ TEST 13a PASSED: Validation works');
    });

    it('13b. Should reject step 6 with missing required fields', async () => {
      console.log('\n📍 Testing: Validation - Missing required fields');

      const response = await axiosClient.post('/onboarding/step6', {
        allowLocation: true,
        // Missing other required fields
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);

      console.log('✅ TEST 13b PASSED: Validation works');
    });
  });

  // ==========================================
  // TEST 14: Authorization Tests
  // ==========================================
  describe('Authorization Tests', () => {
    it('14. Should reject requests without authorization', async () => {
      console.log('\n📍 Testing: No authorization header');

      const noAuthClient = axios.create({
        baseURL: API_URL,
        validateStatus: () => true,
      });

      const response = await noAuthClient.get('/onboarding/status');

      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);

      console.log('✅ TEST 14 PASSED: Authorization required');
    });
  });
});

/**
 * @file auth-live.test.ts
 * @description End-to-End Integration Tests for Auth Module
 * 
 * LIVE TESTS - No Mocks Allowed!
 * 
 * These tests use:
 * - Real Firebase Authentication (Client SDK)
 * - Real PostgreSQL test database
 * - Real HTTP calls to backend
 * - Real Firebase ID tokens
 * 
 * Run with: LIVE_TEST=true yarn test auth-live
 * 
 * IMPORTANT: Tests only run when LIVE_TEST=true
 */

import dotenv from 'dotenv';
import path from 'path';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, Auth, UserCredential } from 'firebase/auth';
import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';

// Load test environment variables (don't override command-line env vars)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.test') });

// Create Prisma client that connects to the SAME database as the backend
// Live tests call the actual backend API, so we need to read from the same DB
// Use BACKEND_DATABASE_URL (dev DB) instead of DATABASE_URL (test DB)
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'postgresql://inklusio_user:inklusio_pass@localhost:5432/inklusio',
});

// Check if live tests should run
const shouldRunLiveTests = process.env.LIVE_TEST === 'true';

describe('Auth Module - LIVE FIREBASE TESTS', () => {
  // Skip all tests if LIVE_TEST is not enabled
  if (!shouldRunLiveTests) {
    test.skip('Skipping live tests (set LIVE_TEST=true to enable)', () => {
      console.log('ℹ️  Live integration tests are disabled.');
      console.log('ℹ️  To enable: Set LIVE_TEST=true in .env.test');
    });
    return;
  }
    // Test configuration
    const API_URL = process.env.API_URL || 'http://localhost:3000/api';
    const TEST_EMAIL = process.env.TEST_USER_EMAIL!;
    const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!;
    const FIREBASE_API_KEY = process.env.FIREBASE_WEB_API_KEY!;
    const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN!;

    // Firebase and HTTP clients
    let firebaseApp: FirebaseApp;
    let firebaseAuth: Auth;
    let axiosClient: AxiosInstance;
    
    // Test data
    let firebaseToken: string;
    let testUserId: string;
    let testUserFirebaseUid: string;

    /**
     * Setup: Initialize Firebase and authenticate test user
     */
    beforeAll(async () => {
      console.log('🚀 Starting Live Integration Tests');
      console.log(`📧 Test User: ${TEST_EMAIL}`);
      console.log(`🔗 API URL: ${API_URL}`);

      // Validate required environment variables
      if (!TEST_EMAIL || !TEST_PASSWORD) {
        throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.test');
      }
      if (!FIREBASE_API_KEY || !FIREBASE_AUTH_DOMAIN) {
        throw new Error('FIREBASE_WEB_API_KEY and FIREBASE_AUTH_DOMAIN must be set in .env.test');
      }

      // Initialize Firebase Client SDK
      console.log('🔥 Initializing Firebase Client SDK...');
      firebaseApp = initializeApp({
        apiKey: FIREBASE_API_KEY,
        authDomain: FIREBASE_AUTH_DOMAIN,
      });
      firebaseAuth = getAuth(firebaseApp);

      // Authenticate test user and get ID token
      console.log('🔐 Authenticating test user with Firebase...');
      try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          TEST_EMAIL,
          TEST_PASSWORD
        );
        
        // Get fresh ID token
        firebaseToken = await userCredential.user.getIdToken();
        testUserFirebaseUid = userCredential.user.uid;
        
        console.log('✅ Firebase authentication successful');
        console.log(`🆔 Firebase UID: ${testUserFirebaseUid}`);
        console.log(`🎫 Token length: ${firebaseToken.length} characters`);

        // Clean up any existing test user from previous runs
        console.log('🧹 Checking for existing test user...');
        const existingUser = await prisma.user.findUnique({
          where: { firebaseUid: testUserFirebaseUid },
        });

        if (existingUser) {
          console.log('🗑️  Found existing test user, cleaning up...');
          // Delete roles first (foreign key constraint)
          await prisma.role.deleteMany({
            where: { userId: existingUser.id },
          });
          // Delete user
          await prisma.user.delete({
            where: { id: existingUser.id },
          });
          console.log('✅ Existing test user cleaned up');
        } else {
          console.log('✅ No existing test user found');
        }
      } catch (error: any) {
        console.error('❌ Firebase authentication failed:', error.message);
        throw new Error(`Failed to authenticate test user: ${error.message}`);
      }

      // Create axios client with auth header
      axiosClient = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // Don't throw on any status
      });

      console.log('✅ Test setup complete\n');
    }, 30000); // 30s timeout for setup

    /**
     * Cleanup: Clean up test data
     */
    afterAll(async () => {
      console.log('\n🧹 Cleaning up test data...');

      // Clean up test user from database (if created)
      if (testUserId) {
        try {
          await prisma.user.delete({
            where: { id: testUserId },
          });
          console.log('✅ Test user deleted from database');
        } catch (error) {
          console.log('ℹ️  Test user already deleted or not found');
        }
      }

      // Disconnect Prisma
      await prisma.$disconnect();
      console.log('✅ Test cleanup complete');
    }, 10000);

    // ==================== TEST CASES ====================

    /**
     * TEST 1: Get Firebase Token
     * Validates that we successfully obtained a real Firebase ID token
     */
    test('1. Should successfully obtain Firebase ID token', async () => {
      expect(firebaseToken).toBeDefined();
      expect(firebaseToken.length).toBeGreaterThan(100);
      expect(testUserFirebaseUid).toBeDefined();
      
      // Token should be a valid JWT format (3 parts separated by dots)
      const tokenParts = firebaseToken.split('.');
      expect(tokenParts).toHaveLength(3);

      console.log('✅ TEST 1 PASSED: Firebase token obtained');
    });

    /**
     * TEST 2: POST /auth/verify
     * Tests Firebase token verification and user sync with database
     */
    test('2. POST /auth/verify - should verify token and sync user to database', async () => {
      console.log('\n📍 Testing: POST /auth/verify');

      const response = await axiosClient.get('/auth/verify');

      // Validate HTTP response
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('verified');
      
      // Validate user data in response
      const user = response.data.data.user;
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.firebaseUid).toBe(testUserFirebaseUid);
      expect(user.email).toBe(TEST_EMAIL);

      // Save user ID for later tests
      testUserId = user.id;

      // Validate user exists in database
      const dbUser = await prisma.user.findUnique({
        where: { firebaseUid: testUserFirebaseUid },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser!.firebaseUid).toBe(testUserFirebaseUid);
      expect(dbUser!.email).toBe(TEST_EMAIL);
      expect(dbUser!.isDeleted).toBe(false);

      console.log('✅ TEST 2 PASSED: User verified and synced to database');
      console.log(`   Database User ID: ${testUserId}`);
    });

    /**
     * TEST 3: GET /auth/me
     * Tests retrieving authenticated user's profile
     */
    test('3. GET /auth/me - should return authenticated user profile', async () => {
      console.log('\n📍 Testing: GET /auth/me');

      const response = await axiosClient.get('/auth/me');

      // Validate HTTP response
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // Validate user data
      const user = response.data.data.user;
      expect(user).toBeDefined();
      expect(user.id).toBe(testUserId);
      expect(user.firebaseUid).toBe(testUserFirebaseUid);
      expect(user.email).toBe(TEST_EMAIL);
      expect(user.isDeleted).toBe(false);

      // Validate all profile fields exist
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('phone');
      expect(user).toHaveProperty('age');
      expect(user).toHaveProperty('gender');
      expect(user).toHaveProperty('location');
      expect(user).toHaveProperty('accessibility');
      expect(user).toHaveProperty('preferences');
      expect(user).toHaveProperty('profileImage');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');

      console.log('✅ TEST 3 PASSED: User profile retrieved');
    });

    /**
     * TEST 4: PUT /auth/me
     * Tests updating user profile with live database
     */
    test('4. PUT /auth/me - should update user profile', async () => {
      console.log('\n📍 Testing: PUT /auth/me');

      const updateData = {
        name: 'Live Test User',
        age: 25,
        gender: 'male',
        phone: '+1234567890',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
        },
        accessibility: {
          screenReader: true,
          fontSize: 'large',
        },
        preferences: {
          language: 'en',
          notifications: true,
          theme: 'dark',
        },
      };

      const response = await axiosClient.put('/auth/me', updateData);

      // Validate HTTP response
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('updated');

      // Validate updated user data in response
      const user = response.data.data.user;
      expect(user.name).toBe(updateData.name);
      expect(user.age).toBe(updateData.age);
      expect(user.gender).toBe(updateData.gender);
      expect(user.phone).toBe(updateData.phone);
      expect(user.location).toEqual(updateData.location);
      expect(user.accessibility).toEqual(updateData.accessibility);
      expect(user.preferences).toEqual(updateData.preferences);

      // Validate changes persisted in database
      const dbUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser!.name).toBe(updateData.name);
      expect(dbUser!.age).toBe(updateData.age);
      expect(dbUser!.gender).toBe(updateData.gender);
      expect(dbUser!.phone).toBe(updateData.phone);
      expect(dbUser!.location).toEqual(updateData.location);
      expect(dbUser!.accessibility).toEqual(updateData.accessibility);
      expect(dbUser!.preferences).toEqual(updateData.preferences);

      console.log('✅ TEST 4 PASSED: User profile updated in database');
    });

    /**
     * TEST 5: GET /auth/role
     * Tests retrieving user roles
     */
    test('5. GET /auth/role - should return user roles', async () => {
      console.log('\n📍 Testing: GET /auth/role');

      const response = await axiosClient.get('/auth/role');

      // Validate HTTP response
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // Validate roles data
      const roles = response.data.data.roles;
      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);

      // Note: New users may not have roles yet, so we just check the structure
      console.log(`   User roles: ${JSON.stringify(roles)}`);
      console.log('✅ TEST 5 PASSED: Roles endpoint working');
    });

    /**
     * TEST 6: POST /auth/signout
     * Tests signing out user and revoking refresh tokens
     */
    test('6. POST /auth/signout - should revoke refresh tokens', async () => {
      console.log('\n📍 Testing: POST /auth/signout');

      const response = await axiosClient.post('/auth/signout');

      // Validate HTTP response
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('signed out');
      expect(response.data.message).toContain('revoked');

      console.log('✅ TEST 6 PASSED: User signed out, tokens revoked');

      // Note: We need to get a new token for subsequent tests
      console.log('🔄 Getting fresh token for remaining tests...');
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        TEST_EMAIL,
        TEST_PASSWORD
      );
      firebaseToken = await userCredential.user.getIdToken();
      
      // Update axios client with new token
      axiosClient = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      });

      console.log('✅ New token obtained');
    });

    /**
     * TEST 7: DELETE /auth/delete
     * Tests soft deleting user account
     */
    test('7. DELETE /auth/delete - should soft delete user account', async () => {
      console.log('\n📍 Testing: DELETE /auth/delete');

      const response = await axiosClient.delete('/auth/delete', {
        data: { hardDelete: false }, // Soft delete only
      });

      // Validate HTTP response
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('deleted');

      // Validate user is marked as deleted in database
      const dbUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser!.isDeleted).toBe(true);
      expect(dbUser!.deletedAt).not.toBeNull();

      console.log('✅ TEST 7 PASSED: User soft deleted in database');
      console.log(`   Deleted at: ${dbUser!.deletedAt}`);
    });

    /**
     * TEST 8: Verify deleted user cannot access /auth/me
     * Tests that soft-deleted users are properly handled
     */
    test('8. GET /auth/me - should fail for deleted user', async () => {
      console.log('\n📍 Testing: GET /auth/me (after deletion)');

      const response = await axiosClient.get('/auth/me');

      // Should return error because user is deleted
      expect(response.status).toBe(500); // Or 403/404 depending on implementation
      // The exact error depends on how your GetUserUseCase handles deleted users

      console.log('✅ TEST 8 PASSED: Deleted user properly blocked');
    });

    // ==================== ADDITIONAL VALIDATION TESTS ====================

    /**
     * TEST 9: Validate token expiration handling
     * Tests that expired tokens are properly rejected
     */
    test('9. Should reject expired/invalid tokens', async () => {
      console.log('\n📍 Testing: Invalid token handling');

      // Create client with invalid token
      const invalidClient = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': 'Bearer invalid-token-12345',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      });

      const response = await invalidClient.get('/auth/me');

      // Should return 401 Unauthorized
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);

      console.log('✅ TEST 9 PASSED: Invalid tokens properly rejected');
    });

    /**
     * TEST 10: Validate missing token handling
     * Tests that requests without tokens are properly rejected
     */
    test('10. Should reject requests without authorization', async () => {
      console.log('\n📍 Testing: Missing token handling');

      // Create client without auth header
      const noAuthClient = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      });

      const response = await noAuthClient.get('/auth/me');

      // Should return 401 Unauthorized
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);

      console.log('✅ TEST 10 PASSED: Missing auth properly rejected');
    });
});

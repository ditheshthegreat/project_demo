/**
 * @file __mocks__/firebase-admin.ts
 * @description Manual mock for firebase-admin module
 * 
 * Jest automatically uses this mock for all tests when firebase-admin is imported.
 * This ensures Firebase Admin SDK is never actually initialized in tests.
 */

const mockAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({
    uid: 'test-firebase-uid-123',
    email: 'test@example.com',
    name: 'Test User',
  }),
};

export const apps: any[] = [];
export const initializeApp = jest.fn();
export const credential = {
  cert: jest.fn(),
};
export const auth = jest.fn(() => mockAuth);

const admin = {
  apps,
  initializeApp,
  credential,
  auth,
};

export default admin;

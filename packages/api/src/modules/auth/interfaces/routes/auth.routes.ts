/**
 * @file auth.routes.ts
 * @module Auth/Interfaces/Routes
 * @description Complete Firebase Auth Routes with Swagger Documentation
 */

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyAuth } from "../../../../shared/middleware/verifyAuth.middleware";
import { uploadProfileImage } from "../../../../shared/middleware/upload.middleware";

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor(authController: AuthController) {
    this.router = Router();
    this.authController = authController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/auth/verify:
     *   post:
     *     summary: Verify Firebase token and sync user profile
     *     description: Verifies Firebase ID token and ensures user exists in database. Creates user on first login. Optionally registers FCM push token for notifications.
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               fcmToken:
     *                 type: string
     *                 description: Firebase Cloud Messaging token (optional)
     *                 example: "fKj8zXqT3E:APA91bF..."
     *               deviceType:
     *                 type: string
     *                 enum: [ANDROID, IOS, WEB]
     *                 description: Device platform type (required if fcmToken provided)
     *                 example: "ANDROID"
     *               deviceId:
     *                 type: string
     *                 description: Optional device identifier
     *                 example: "device-12345"
     *     responses:
     *       200:
     *         description: User verified successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *                 message:
     *                   type: string
     *                   example: "User verified successfully"
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.post("/verify", verifyAuth, this.authController.verify);

    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Get authenticated user profile
     *     description: Returns the complete profile of the authenticated user
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.get("/me", verifyAuth, this.authController.getMe);

    /**
     * @swagger
     * /api/auth/dev/signup:
     *   post:
     *     summary: Development signup - Create Firebase user
     *     description: |
     *       **DEVELOPMENT ONLY** - Creates a new Firebase user and returns ID token.
     *       Disabled in production. Use the returned idToken as Bearer token.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: newuser@example.com
     *               password:
     *                 type: string
     *                 format: password
     *                 minLength: 6
     *                 example: Test@123
     *               name:
     *                 type: string
     *                 example: Test User
     *     responses:
     *       201:
     *         description: User created successfully - Copy the idToken
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     firebaseUid:
     *                       type: string
     *                     email:
     *                       type: string
     *                     name:
     *                       type: string
     *                     idToken:
     *                       type: string
     *                       description: Use this as Bearer token
     *                       example: eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1...
     *                     refreshToken:
     *                       type: string
     *                     expiresIn:
     *                       type: string
     *                       example: "3600"
     *                 message:
     *                   type: string
     *                   example: User created successfully - use idToken as Bearer token
     *       400:
     *         description: Missing email/password or weak password
     *       409:
     *         description: Email already exists
     *       403:
     *         description: Endpoint disabled in production
     */
    this.router.post("/dev/signup", this.authController.devSignup);

    /**
     * @swagger
     * /api/auth/dev/login:
     *   post:
     *     summary: Development login - Get Firebase token
     *     description: |
     *       **DEVELOPMENT ONLY** - Returns Firebase ID token for testing.
     *       Disabled in production. Use the returned idToken as Bearer token.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: ajith@inklusio.com
     *               password:
     *                 type: string
     *                 format: password
     *                 example: Ajith@123
     *     responses:
     *       200:
     *         description: Login successful - Copy the idToken
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     idToken:
     *                       type: string
     *                       description: Use this as Bearer token
     *                       example: eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1...
     *                     refreshToken:
     *                       type: string
     *                     expiresIn:
     *                       type: string
     *                       example: "3600"
     *                     localId:
     *                       type: string
     *                     email:
     *                       type: string
     *                 message:
     *                   type: string
     *                   example: Login successful - use idToken as Bearer token
     *       400:
     *         description: Missing email or password
     *       401:
     *         description: Invalid credentials
     *       403:
     *         description: Endpoint disabled in production
     */
    this.router.post("/dev/login", this.authController.devLogin);

    /**
     * @swagger
     * /api/auth/me:
     *   put:
     *     summary: Update user profile with optional image upload
     *     description: Updates the authenticated user's profile information. Profile image is uploaded to S3 and returned as a signed URL.
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: "John Doe"
     *               phone:
     *                 type: string
     *                 example: "+1234567890"
     *               age:
     *                 type: integer
     *                 example: 25
     *               gender:
     *                 type: string
     *                 example: "male"
     *               profileImage:
     *                 type: string
     *                 format: binary
     *                 description: Profile image file (JPEG, PNG, or WebP, max 5MB)
     *               location:
     *                 type: string
     *                 example: '{"city":"New York","state":"NY","country":"USA"}'
     *                 description: Location data as JSON string
     *               accessibility:
     *                 type: string
     *                 example: '{"screenReader":true,"fontSize":"large"}'
     *                 description: Accessibility settings as JSON string
     *               preferences:
     *                 type: string
     *                 example: '{"language":"en","notifications":true}'
     *                 description: User preferences as JSON string
     *     responses:
     *       200:
     *         description: Profile updated successfully. ProfileImage is returned as a signed S3 URL (valid for 1 hour).
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                         name:
     *                           type: string
     *                         email:
     *                           type: string
     *                         profileImage:
     *                           type: string
     *                           description: S3 signed URL (valid for 1 hour)
     *                           example: "https://s3.amazonaws.com/bucket/profiles/123.jpg?signature=..."
     *                 message:
     *                   type: string
     *                   example: "Profile updated successfully"
     *       400:
     *         description: Invalid file type or size
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.put("/me", verifyAuth, uploadProfileImage as any, this.authController.updateMe);

    /**
     * @swagger
     * /api/auth/delete:
     *   delete:
     *     summary: Delete user account
     *     description: Soft deletes the user account. Optionally hard deletes from Firebase.
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               hardDelete:
     *                 type: boolean
     *                 description: If true, also deletes from Firebase
     *                 example: false
     *     responses:
     *       200:
     *         description: Account deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Account deleted successfully"
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.delete("/delete", verifyAuth, this.authController.deleteAccount);

    /**
     * @swagger
     * /api/auth/role:
     *   get:
     *     summary: Get user roles
     *     description: Returns all roles assigned to the authenticated user
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Roles retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     roles:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["user", "moderator"]
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.get("/role", verifyAuth, this.authController.getRoles);

    /**
     * @swagger
     * /api/auth/validate:
     *   post:
     *     summary: Validate Firebase token
     *     description: Token introspection endpoint for internal services
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *             properties:
     *               token:
     *                 type: string
     *                 description: Firebase ID token to validate
     *     responses:
     *       200:
     *         description: Token validation result
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     valid:
     *                       type: boolean
     *                     expired:
     *                       type: boolean
     *                     revoked:
     *                       type: boolean
     *                     payload:
     *                       type: object
     *       400:
     *         description: Token is required
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.post("/validate", this.authController.validateToken);

    /**
     * @swagger
     * /api/auth/signout:
     *   post:
     *     summary: Sign out user
     *     description: Revokes all Firebase refresh tokens for the user. Optionally removes device-specific FCM push token.
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               fcmToken:
     *                 type: string
     *                 description: FCM token to remove from this device (optional)
     *                 example: "fKj8zXqT3E:APA91bF..."
     *     responses:
     *       200:
     *         description: User signed out successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "User signed out successfully. Refresh tokens revoked."
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.post("/signout", verifyAuth, this.authController.signout);

    /**
     * @swagger
     * /api/auth/resetPassword:
     *   post:
     *     summary: Generate password reset link
     *     description: Generates a Firebase password reset link for the provided email
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "user@example.com"
     *     responses:
     *       200:
     *         description: Password reset link generated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     resetLink:
     *                       type: string
     *                 message:
     *                   type: string
     *                   example: "Password reset link generated successfully"
     *       400:
     *         description: Email is required
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.post("/resetPassword", this.authController.resetPassword);

    /**
     * @swagger
     * /api/auth/sendVerification:
     *   post:
     *     summary: Generate email verification link
     *     description: Generates a Firebase email verification link
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "user@example.com"
     *     responses:
     *       200:
     *         description: Email verification link generated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     verificationLink:
     *                       type: string
     *                 message:
     *                   type: string
     *                   example: "Email verification link generated successfully"
     *       400:
     *         description: Email is required
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.post("/sendVerification", this.authController.sendVerification);

    /**
     * @swagger
     * /api/auth/linkProvider:
     *   post:
     *     summary: Link authentication provider
     *     description: Links an additional authentication provider to the user account
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - provider
     *             properties:
     *               provider:
     *                 type: string
     *                 enum: [google.com, apple.com, password]
     *                 example: "google.com"
     *               providerId:
     *                 type: string
     *     responses:
     *       200:
     *         description: Provider linked successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Provider google.com linked successfully"
     *       400:
     *         description: Provider is required
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.post("/linkProvider", verifyAuth, this.authController.linkProvider);

    /**
     * @swagger
     * /api/auth/unlinkProvider:
     *   post:
     *     summary: Unlink authentication provider
     *     description: Unlinks an authentication provider from the user account
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - provider
     *             properties:
     *               provider:
     *                 type: string
     *                 enum: [google.com, apple.com, password]
     *                 example: "google.com"
     *     responses:
     *       200:
     *         description: Provider unlinked successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Provider google.com unlinked successfully"
     *       400:
     *         description: Provider is required
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
    this.router.post("/unlinkProvider", verifyAuth, this.authController.unlinkProvider);
  }

  public getRouter(): Router {
    return this.router;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         firebaseUid:
 *           type: string
 *           example: "firebase-uid-123abc"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         profileImage:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         gender:
 *           type: string
 *           example: "male"
 *         age:
 *           type: integer
 *           example: 25
 *         location:
 *           type: object
 *         accessibility:
 *           type: object
 *         preferences:
 *           type: object
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized - Invalid or missing Firebase token
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Unauthorized"
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */

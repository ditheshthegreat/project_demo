/**
 * @file onboarding.routes.ts
 * @module Onboarding/Interfaces/Routes
 * @description Onboarding Routes with Swagger Documentation
 * 
 * @swagger
 * tags:
 *   - name: Onboarding
 *     description: User onboarding and profile completion APIs - Complete 6-step onboarding process for new users
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Firebase ID token obtained after authentication
 * 
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation completed successfully
 *         data:
 *           type: object
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Validation error
 * 
 *     Step1BasicInfoDto:
 *       type: object
 *       required:
 *         - gender
 *         - dateOfBirth
 *       properties:
 *         gender:
 *           type: string
 *           description: User's gender
 *           example: male
 *         dateOfBirth:
 *           type: string
 *           format: date-time
 *           description: User's date of birth in ISO 8601 format
 *           example: 2000-01-15T00:00:00.000Z
 *         description:
 *           type: string
 *           description: Optional user bio/description
 *           example: Hello, I'm new here!
 * 
 *     Step2LocationDto:
 *       type: object
 *       required:
 *         - city
 *         - federalState
 *         - allowLocation
 *       properties:
 *         city:
 *           type: string
 *           description: User's city
 *           example: Berlin
 *         federalState:
 *           type: string
 *           description: User's federal state/region
 *           example: Berlin
 *         allowLocation:
 *           type: boolean
 *           description: Whether to allow location-based features
 *           example: true
 * 
 *     Step3InterestsDto:
 *       type: object
 *       required:
 *         - interests
 *       properties:
 *         interests:
 *           type: array
 *           description: User's interests (minimum 3 required)
 *           minItems: 3
 *           items:
 *             type: string
 *             enum:
 *               - Sports & Exercise
 *               - Arts
 *               - Culture
 *               - Music
 *               - Travel
 *               - Cooking
 *               - Technology
 *               - Reading
 *               - Crafts
 *               - Nature & Environment
 *               - Game Nights
 *               - Photography
 *               - Theater
 *               - Dance
 *               - Volunteering
 *               - Language
 *               - Learning
 *               - Movies & TV Shows
 *               - Fashion & Style
 *               - Gardening
 *               - Politics
 *               - History
 *           example: ["Sports & Exercise", "Music", "Technology"]
 * 
 *     Step4HobbiesDto:
 *       type: object
 *       required:
 *         - hobbies
 *       properties:
 *         hobbies:
 *           type: array
 *           description: User's hobbies (minimum 1 required)
 *           minItems: 1
 *           items:
 *             type: string
 *             enum:
 *               - Painting & Drawing
 *               - Writing
 *               - Knitting & Crocheting
 *               - Collecting
 *               - Board Game Nights
 *               - Hiking
 *               - Swimming
 *               - Yoga
 *               - Meditation
 *               - Singing
 *               - Musical Instruments
 *               - Computer Games
 *               - Chess
 *               - Puzzles
 *               - Baking
 *               - Crafts
 *               - Model Making
 *               - Origami
 *               - Calligraphy
 *           example: ["Hiking", "Swimming", "Yoga"]
 * 
 *     Step5RequirementsDto:
 *       type: object
 *       required:
 *         - accessibilityRequirements
 *       properties:
 *         accessibilityRequirements:
 *           type: array
 *           description: User's accessibility requirements
 *           items:
 *             type: string
 *             enum:
 *               - Wheelchair accessible
 *               - Visual impairment
 *               - Hearing impairment
 *               - Learning disability
 *               - Mobility aids
 *               - Speech support
 *               - Cognitive support
 *               - Psychological support
 *               - Assistive devices you use
 *           example: ["Wheelchair accessible", "Visual impairment"]
 * 
 *     Step5ToolsDto:
 *       type: object
 *       required:
 *         - accessibilityTools
 *       properties:
 *         accessibilityTools:
 *           type: array
 *           description: Accessibility tools the user uses
 *           items:
 *             type: string
 *             enum:
 *               - Wheelchair
 *               - Walking aids
 *               - Hearing aids
 *               - White cane
 *               - Braille display
 *               - Speech output
 *               - Communication aids
 *               - Prostheses
 *               - Orthotics
 *               - None
 *           example: ["Wheelchair", "Hearing aids"]
 * 
 *     Step5LookingForDto:
 *       type: object
 *       required:
 *         - lookingFor
 *       properties:
 *         lookingFor:
 *           type: array
 *           description: What the user is looking for (minimum 1 required)
 *           minItems: 1
 *           items:
 *             type: string
 *             enum:
 *               - New friendships
 *               - Support groups
 *               - Activity partners
 *               - Mentoring
 *               - Romantic relationship
 *               - Professional contacts
 *               - Hobbies
 *               - Travel partners
 *               - Study groups
 *               - Preferred communication
 *           example: ["New friendships", "Activity partners", "Hobbies"]
 * 
 *     Step5CommunicationDto:
 *       type: object
 *       required:
 *         - communicationPreferences
 *       properties:
 *         communicationPreferences:
 *           type: array
 *           description: User's preferred communication methods (minimum 1 required)
 *           minItems: 1
 *           items:
 *             type: string
 *             enum:
 *               - Direct messages
 *               - Group chats
 *               - Video calls
 *               - Voice messages
 *               - Sign language
 *               - Plain language
 *               - Image communication
 *               - Written communication
 *               - Preferred
 *           example: ["Direct messages", "Video calls"]
 * 
 *     Step6PrivacyDto:
 *       type: object
 *       required:
 *         - allowLocation
 *         - showAge
 *         - allowMatching
 *         - publicProfile
 *         - allowNotifications
 *       properties:
 *         allowLocation:
 *           type: boolean
 *           description: Allow location-based features
 *           example: true
 *         showAge:
 *           type: boolean
 *           description: Show age on profile
 *           example: false
 *         allowMatching:
 *           type: boolean
 *           description: Allow matching with other users
 *           example: true
 *         publicProfile:
 *           type: boolean
 *           description: Make profile public
 *           example: true
 *         allowNotifications:
 *           type: boolean
 *           description: Allow push notifications
 *           example: true
 * 
 *     OnboardingStatusResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             currentStep:
 *               type: integer
 *               description: Current onboarding step (0-6)
 *               example: 3
 *             completed:
 *               type: boolean
 *               description: Whether onboarding is completed
 *               example: false
 *             totalSteps:
 *               type: integer
 *               description: Total number of onboarding steps
 *               example: 6
 *             completedSteps:
 *               type: array
 *               description: Array of completed step numbers
 *               items:
 *                 type: integer
 *               example: [1, 2, 3]
 *             data:
 *               type: object
 *               description: User's onboarding data
 */

import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';

export class OnboardingRoutes {
  public router: Router;
  private onboardingController: OnboardingController;

  constructor(onboardingController: OnboardingController) {
    this.router = Router();
    this.onboardingController = onboardingController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {

/**
 * @swagger
 * /api/onboarding/step1:
 *   post:
 *     summary: Complete Step 1 - Basic Information
 *     description: Submit basic user information including gender, date of birth, and optional description
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step1BasicInfoDto'
 *     responses:
 *       200:
 *         description: Step 1 completed successfully
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
 *                   example: Step 1 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Validation error - Invalid or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step1', verifyAuth, this.onboardingController.step1.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/step2:
 *   post:
 *     summary: Complete Step 2 - Location Information
 *     description: Submit user's location information including city, federal state, and location permission
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step2LocationDto'
 *     responses:
 *       200:
 *         description: Step 2 completed successfully
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
 *                   example: Step 2 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Validation error - Invalid or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step2', verifyAuth, this.onboardingController.step2.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/step3:
 *   post:
 *     summary: Complete Step 3 - Interests (minimum 3 required)
 *     description: Submit user's interests - at least 3 interests must be selected from the allowed list
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step3InterestsDto'
 *     responses:
 *       200:
 *         description: Step 3 completed successfully
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
 *                   example: Step 3 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: integer
 *                       example: 3
 *                     count:
 *                       type: integer
 *                       description: Number of interests selected
 *                       example: 4
 *       400:
 *         description: Validation error - Less than 3 interests or invalid interests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step3', verifyAuth, this.onboardingController.step3.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/step4:
 *   post:
 *     summary: Complete Step 4 - Hobbies
 *     description: Submit user's hobbies - at least 1 hobby must be selected from the allowed list
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step4HobbiesDto'
 *     responses:
 *       200:
 *         description: Step 4 completed successfully
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
 *                   example: Step 4 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: integer
 *                       example: 4
 *                     count:
 *                       type: integer
 *                       description: Number of hobbies selected
 *                       example: 3
 *       400:
 *         description: Validation error - No hobbies provided or invalid hobbies
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step4', verifyAuth, this.onboardingController.step4.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/step5/requirements:
 *   post:
 *     summary: Complete Step 5.1 - Accessibility Requirements
 *     description: Submit user's accessibility requirements to help match with appropriate activities and venues
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step5RequirementsDto'
 *     responses:
 *       200:
 *         description: Step 5.1 completed successfully
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
 *                   example: Step 5.1 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: string
 *                       example: "5.1"
 *       400:
 *         description: Validation error - Invalid accessibility requirements
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step5/requirements', verifyAuth, this.onboardingController.step5Requirements.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/step5/tools:
 *   post:
 *     summary: Complete Step 5.2 - Accessibility Tools
 *     description: Submit accessibility tools the user uses to inform matching and activity suggestions
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step5ToolsDto'
 *     responses:
 *       200:
 *         description: Step 5.2 completed successfully
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
 *                   example: Step 5.2 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: string
 *                       example: "5.2"
 *       400:
 *         description: Validation error - Invalid accessibility tools
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step5/tools', verifyAuth, this.onboardingController.step5Tools.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/step5/looking-for:
 *   post:
 *     summary: Complete Step 5.3 - What Are You Looking For
 *     description: Submit what the user is looking for on the platform (minimum 1 required) to improve matching
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step5LookingForDto'
 *     responses:
 *       200:
 *         description: Step 5.3 completed successfully
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
 *                   example: Step 5.3 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: string
 *                       example: "5.3"
 *       400:
 *         description: Validation error - No selection or invalid options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step5/looking-for', verifyAuth, this.onboardingController.step5LookingFor.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/step5/communication:
 *   post:
 *     summary: Complete Step 5.4 - Communication Preferences
 *     description: Submit user's preferred communication methods (minimum 1 required) for connecting with others
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step5CommunicationDto'
 *     responses:
 *       200:
 *         description: Step 5.4 completed successfully
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
 *                   example: Step 5.4 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: string
 *                       example: "5.4"
 *       400:
 *         description: Validation error - No preferences or invalid options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step5/communication', verifyAuth, this.onboardingController.step5Communication.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/step6:
 *   post:
 *     summary: Complete Step 6 - Privacy Settings
 *     description: Submit user's privacy preferences including location, age visibility, matching, profile visibility, and notifications
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step6PrivacyDto'
 *     responses:
 *       200:
 *         description: Step 6 completed successfully
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
 *                   example: Step 6 completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: integer
 *                       example: 6
 *       400:
 *         description: Validation error - Missing required privacy settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/step6', verifyAuth, this.onboardingController.step6.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/complete:
 *   post:
 *     summary: Complete onboarding process
 *     description: Mark the onboarding process as complete after all 6 steps are finished
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
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
 *                   example: Onboarding completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     completed:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Validation error - Not all steps completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.post('/complete', verifyAuth, this.onboardingController.complete.bind(this.onboardingController));

/**
 * @swagger
 * /api/onboarding/status:
 *   get:
 *     summary: Get onboarding status
 *     description: Retrieve current onboarding progress including completed steps and user data
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingStatusResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
    this.router.get('/status', verifyAuth, this.onboardingController.getStatus.bind(this.onboardingController));

  }

  public getRouter(): Router {
    return this.router;
  }
}

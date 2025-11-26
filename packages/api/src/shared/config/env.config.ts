/**
 * @file env.config.ts
 * @module Shared/Config
 * @layer Shared
 * @description Environment Configuration Module
 * 
 * Centralizes all environment variable loading and configuration for the application.
 * Loads environment variables from .env file at project root and exports them as a
 * typed configuration object. This module is a critical dependency for all other
 * modules that need access to database URLs, JWT secrets, server ports, etc.
 * 
 * **Business Logic:**
 * - Loads environment variables at application startup
 * - Provides type-safe access to configuration values
 * - Sets default fallback values for development environments
 * - Separates configuration concerns from business logic
 * 
 * **Dependencies:**
 * - dotenv: For loading .env files
 * - path: For resolving absolute file paths
 * 
 * **Used By:**
 * - Server initialization (server.ts)
 * - Database client (prismaClient.ts)
 * - JWT providers (jwtProvider.ts)
 * - All modules requiring configuration
 * 
 * @example
 * import { envConfig } from './shared/config/env.config';
 * console.log(envConfig.port); // 3000
 * console.log(envConfig.jwt.secret); // 'your-secret'
 */

import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env from monorepo root - try multiple paths
const possiblePaths = [
  path.resolve(process.cwd(), "../../.env"),      // From packages/api
  path.resolve(process.cwd(), ".env"),            // From root
  path.resolve(__dirname, "../../../../.env"),    // From compiled dist
];

let envPath = possiblePaths.find(p => fs.existsSync(p));
if (!envPath) {
  console.warn("⚠️ .env file not found in any expected location");
  envPath = possiblePaths[0]; // Default to first path
}

const result = dotenv.config({ path: envPath, override: true });
if (result.error) {
  console.error("❌ Error loading .env:", result.error.message);
}

/**
 * Environment Configuration Object
 * 
 * Contains all application configuration loaded from environment variables.
 * Provides type-safe access to configuration with sensible defaults.
 * 
 * @constant
 * @type {Object}
 */
export const envConfig = {
  /** Server port number (default: 3000) */
  port: process.env.PORT || 3000,
  
  /** Node environment: development, production, or test (default: development) */
  nodeEnv: process.env.NODE_ENV || "development",
  
  /** Database configuration */
  database: {
    /** PostgreSQL connection string from DATABASE_URL env variable */
    url: process.env.DATABASE_URL || "",
  },
  
  /** Firebase Admin SDK configuration for authentication */
  firebase: {
    /** Firebase project ID from Google Cloud Console */
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    
    /** Firebase service account client email */
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    
    /** Firebase service account private key (with escaped newlines) */
    privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
  },
};

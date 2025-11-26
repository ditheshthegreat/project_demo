/**
 * @file app.ts
 * @module App
 * @layer Application
 * @description Express Application Factory
 * 
 * Creates and configures the Express application without starting the server.
 * This separation allows for easier testing by importing the app without
 * starting the HTTP server.
 * 
 * **Used By:**
 * - server.ts: Starts the HTTP server
 * - Test files: Import app for integration testing
 * 
 * @example
 * import app from './app';
 * app.listen(3000);
 */

import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "../shared/middleware/errorHandler.middleware";
import { notFoundHandler } from "../shared/middleware/notFound.middleware";
import { setupSwagger } from "./swagger";

/**
 * Create Express Application
 * 
 * Configures middleware, routes, and error handlers without starting the server.
 * 
 * @returns {Application} Configured Express application
 */
function createApp(): Application {
  const app = express();

  // Security and parsing middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger documentation
  setupSwagger(app);

  // API routes
  app.use("/api", routes);

  // Error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/**
 * Express Application Instance
 * 
 * Singleton app instance for use in server and tests.
 */
export default createApp();

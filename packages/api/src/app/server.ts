/**
 * @file server.ts
 * @module App
 * @layer Application Entry Point
 * @description Express Server Configuration and Initialization
 * 
 * Main application entry point that configures and starts the Express server.
 * Sets up middleware, routes, error handling, API documentation, and database
 * connections. This file orchestrates the entire application startup sequence.
 * 
 * **Responsibilities:**
 * - Initialize Express application
 * - Configure security middleware (helmet, cors)
 * - Set up request parsing (JSON, URL-encoded)
 * - Mount API routes
 * - Configure Swagger/OpenAPI documentation
 * - Set up centralized error handling
 * - Start HTTP server on configured port
 * 
 * **Startup Sequence:**
 * 1. Load environment configuration
 * 2. Create Express app instance
 * 3. Apply security middleware (helmet, cors)
 * 4. Configure body parsers
 * 5. Setup Swagger documentation
 * 6. Mount application routes
 * 7. Apply error handlers (404, global error handler)
 * 8. Start listening on configured port
 * 
 * **Environment Dependencies:**
 * - PORT: Server port (default: 3000)
 * - NODE_ENV: Environment mode (development/production)
 * - DATABASE_URL: PostgreSQL connection string
 * 
 * @example
 * // Start the server
 * node dist/app/server.js
 * // Server will be available at http://localhost:3000
 */

import { envConfig } from "../shared/config/env.config";
import app from "./app";

/**
 * Start HTTP Server
 * 
 * Starts the Express server and begins listening for incoming HTTP requests
 * on the configured port. Logs startup information including URLs for the
 * API documentation and health check endpoint.
 * 
 * **Server Endpoints:**
 * - API: http://localhost:PORT/api/*
 * - Docs: http://localhost:PORT/api/docs
 * - Health: http://localhost:PORT/api/health
 */
const port = envConfig.port;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 Environment: ${envConfig.nodeEnv}`);
  console.log(`🔗 API URL: http://localhost:${port}/api`);
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
});

export default app;

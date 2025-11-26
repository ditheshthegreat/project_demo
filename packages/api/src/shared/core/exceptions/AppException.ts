/**
 * @file AppException.ts
 * @module Shared/Core/Exceptions
 * @layer Shared
 * @description Custom Application Exception Class
 * 
 * Provides a standardized exception class for handling business logic errors
 * and operational failures throughout the application. Extends the native
 * Error class with additional context like HTTP status codes and error codes.
 * 
 * **Business Logic:**
 * - Standardizes error handling across all modules
 * - Provides HTTP status codes for proper API responses
 * - Supports custom error codes for client-side error identification
 * - Maintains error stack traces for debugging
 * 
 * **Used By:**
 * - All use cases throwing business logic errors
 * - Controllers for validation errors
 * - Middleware for error transformation
 * - Error handler middleware
 * 
 * @example
 * // Throwing a validation error
 * throw new AppException("Invalid email format", 400, "VALIDATION_ERROR");
 * 
 * // Throwing a not found error
 * throw new AppException("User not found", 404, "USER_NOT_FOUND");
 * 
 * // Throwing an unauthorized error
 * throw new AppException("Invalid credentials", 401, "UNAUTHORIZED");
 */

/**
 * Custom Application Exception
 * 
 * Extends the native Error class to provide structured error information
 * including HTTP status codes and custom error codes for API responses.
 * 
 * @class AppException
 * @extends {Error}
 */
export class AppException extends Error {
  /**
   * Creates an instance of AppException
   * 
   * @param {string} message - Human-readable error message describing what went wrong
   * @param {number} [statusCode=500] - HTTP status code to return (400, 401, 404, 409, 500, etc.)
   * @param {string} [code] - Optional error code for client-side error identification (e.g., "USER_NOT_FOUND")
   * 
   * @example
   * throw new AppException("Email already exists", 409, "EMAIL_DUPLICATE");
   */
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AppException";
    Object.setPrototypeOf(this, AppException.prototype);
  }
}

/**
 * Bad Request Exception
 * 
 * Represents a client-side error with a 400 HTTP status code.
 * 
 * @class BadRequestException
 * @extends {AppException}
 */
export class BadRequestException extends AppException {
  /**
   * Creates an instance of BadRequestException
   * 
   * @param {string} message - Human-readable error message describing what went wrong
   * @param {string} [code] - Optional error code for client-side error identification (e.g., "VALIDATION_ERROR")
   * 
   * @example
   * throw new BadRequestException("Invalid request payload", "VALIDATION_ERROR");
   */
  constructor(message: string, code?: string) {
    super(message, 400, code);
  }
}

/** Unauthorized Exception - 401 status for authentication failures */
export class UnauthorizedException extends AppException {
  constructor(message: string = "Unauthorized", code?: string) {
    super(message, 401, code);
  }
}

/** Forbidden Exception - 403 status for authorization failures */
export class ForbiddenException extends AppException {
  constructor(message: string = "Forbidden", code?: string) {
    super(message, 403, code);
  }
}

/** Not Found Exception - 404 status for missing resources */
export class NotFoundException extends AppException {
  constructor(message: string = "Resource not found", code?: string) {
    super(message, 404, code);
  }
}

/** Conflict Exception - 409 status for resource conflicts (e.g., duplicate email) */
export class ConflictException extends AppException {
  constructor(message: string, code?: string) {
    super(message, 409, code);
  }
}

/** Internal Server Exception - 500 status for unexpected server errors */
export class InternalServerException extends AppException {
  constructor(message: string = "Internal server error", code?: string) {
    super(message, 500, code);
  }
}

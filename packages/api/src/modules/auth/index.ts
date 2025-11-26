/**
 * Auth Module Public API (Facade Pattern)
 * 
 * This file exports only the public interface of the Auth module.
 * Other modules should import from this file instead of directly accessing internal files.
 * 
 * Example:
 * ```typescript
 * import { authRouter, verifyAuth } from '../auth';
 * ```
 */

// Export the router for mounting in main app
export { authRouter } from "./auth.module";

// Export domain entities (read-only access)
export { User } from "./domain/user.entity";

// Export useful types for other modules
export type { IUserRepository } from "./domain/repositories/IUserRepository";

// Export middleware for protecting routes in other modules
export { verifyAuth, AuthRequest } from "../../shared/middleware/verifyAuth.middleware";

/**
 * DO NOT EXPORT:
 * - Use cases (internal to auth module)
 * - Controllers (internal to auth module)
 * - Infrastructure implementations (internal to auth module)
 * - Repository implementations (internal to auth module)
 * 
 * This ensures loose coupling between modules and allows the auth
 * implementation to change without affecting other modules.
 */

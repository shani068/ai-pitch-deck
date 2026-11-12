import { createAuthClient } from "better-auth/react";

/**
 * Browser client for /api/auth on the same origin (no baseURL needed). Sign-in and sign-up go
 * through it, not through Server Actions, so Better Auth's rate limiter and origin/CSRF checks
 * apply to every attempt.
 */
export const authClient = createAuthClient();

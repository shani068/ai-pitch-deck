import "server-only";

import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

import { directConnectionUrl } from "@/src/prisma/connection-url";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, NameSchema } from "./validation";

const DAY = 60 * 60 * 24;

/**
 * Email + password accounts. Better Auth's built-in adapter talks to the tables declared in
 * src/prisma/contract.prisma through its own pg pool on Neon's direct endpoint (Neon's pooler
 * rejects the session settings; see connection-url.ts). `BETTER_AUTH_SECRET` and
 * `BETTER_AUTH_URL` are read from the environment by Better Auth itself.
 */
export const auth = betterAuth({
  appName: "AI Pitch Deck",
  database: new Pool({ connectionString: directConnectionUrl(), max: 5 }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: MAX_PASSWORD_LENGTH,
    autoSignIn: true,
  },
  session: {
    expiresIn: 7 * DAY,
    updateAge: DAY,
    // Signed cookie cache: the header's session check is answered without a database read
    // for up to 5 minutes at a time.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: {
    // Database storage holds across serverless instances (memory would reset per instance).
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Server-side name rule: Better Auth accepts any string, so trim and bound it here.
        async before(user) {
          const name = NameSchema.safeParse(user.name);
          if (!name.success) {
            throw new APIError("BAD_REQUEST", {
              code: "INVALID_NAME",
              message: name.error.issues[0]?.message ?? "Please enter your name.",
            });
          }
          return { data: { ...user, name: name.data } };
        },
      },
    },
  },
  // Lets server code that calls auth.api set cookies; must stay the last plugin.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

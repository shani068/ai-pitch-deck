import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/src/auth/server";

// Better Auth's endpoints (/api/auth/*): sign-up, sign-in, sign-out, get-session. It applies its
// own origin/CSRF checks and rate limits to every request that comes through here.
export const { GET, POST } = toNextJsHandler(auth);

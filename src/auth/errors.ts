import type { AuthField } from "./validation";

/** What the form shows: a message under one field, or a message for the whole form. */
export type AuthFormError = { field?: AuthField; message: string; suggestSignIn?: boolean };

export const GENERIC_AUTH_ERROR = "Something went wrong. Please try again.";

/** The shape Better Auth's client returns in `{ error }`. Only `code` and `status` are used. */
type BetterAuthError = { code?: string | null; status?: number | null } | null | undefined;

/**
 * Maps a Better Auth error to user-facing text. The raw server message is never shown, and
 * sign-in failures always read the same, so the form does not reveal which emails exist.
 */
export function toAuthFormError(error: BetterAuthError): AuthFormError {
  if (error?.status === 429) {
    return { message: "Too many attempts. Please wait a minute and try again." };
  }

  switch (error?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "INVALID_PASSWORD":
      return { message: "Invalid email or password." };
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return {
        field: "email",
        message: "An account with this email already exists.",
        suggestSignIn: true,
      };
    case "PASSWORD_TOO_SHORT":
      return { field: "password", message: "Use at least 8 characters for your password." };
    case "PASSWORD_TOO_LONG":
      return { field: "password", message: "Use at most 128 characters for your password." };
    case "INVALID_EMAIL":
      return { field: "email", message: "Please enter a valid email address." };
    case "INVALID_NAME":
      return { field: "name", message: "Please enter a name of up to 100 characters." };
    default:
      return { message: GENERIC_AUTH_ERROR };
  }
}

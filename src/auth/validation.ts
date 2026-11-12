import { z } from "zod";

// Shared by the auth forms (immediate feedback) and the server (the `user.create.before` hook in
// src/auth/server.ts). Better Auth also enforces the password limits on the server through
// `emailAndPassword.minPasswordLength` / `maxPasswordLength`, set from these constants.
// No `server-only`: the client forms import it, and Vitest tests it.

export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 100;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export const NameSchema = z
  .string({ error: "Please enter your name." })
  .trim()
  .min(MIN_NAME_LENGTH, { error: "Please enter your name." })
  .max(MAX_NAME_LENGTH, { error: `Please keep your name under ${MAX_NAME_LENGTH} characters.` });

export const EmailSchema = z
  .string({ error: "Please enter your email address." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Please enter a valid email address." }));

export const PasswordSchema = z
  .string({ error: "Please enter a password." })
  .min(MIN_PASSWORD_LENGTH, {
    error: `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`,
  })
  .max(MAX_PASSWORD_LENGTH, {
    error: `Use at most ${MAX_PASSWORD_LENGTH} characters for your password.`,
  });

export const SignUpSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

// Sign-in checks only that a password was entered: length rules belong to sign-up, and hinting
// at them here would tell an attacker nothing useful while confusing a real user.
export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, { error: "Please enter your password." }),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type AuthField = keyof SignUpInput;

/** First error message per field, for showing under each input. */
export function fieldErrors(error: z.ZodError): Partial<Record<AuthField, string>> {
  const errors: Partial<Record<AuthField, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "name" || field === "email" || field === "password") && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/src/auth/client";
import { safeNextPath } from "@/src/auth/redirect";
import { toAuthFormError, type AuthFormError } from "@/src/auth/errors";
import { fieldErrors, SignUpSchema, type AuthField } from "@/src/auth/validation";
import { EnvelopeIcon, UserIcon } from "@/src/components/icons";

import { FormAlert } from "./form-alert";
import { IconInput } from "./icon-input";
import { PasswordInput } from "./password-input";
import { SubmitButton } from "./submit-button";

/**
 * Validates with the shared Zod schema for instant feedback, then posts through Better Auth's
 * client so its rate limiter and origin checks apply. The server re-validates every field.
 */
export function SignUpForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<AuthField, string>>>({});
  const [formError, setFormError] = useState<AuthFormError | null>(null);
  const [suggestSignIn, setSuggestSignIn] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const data = new FormData(event.currentTarget);
    const input = SignUpSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      password: data.get("password"),
    });
    setFormError(null);
    setSuggestSignIn(false);
    if (!input.success) {
      setErrors(fieldErrors(input.error));
      return;
    }
    setErrors({});

    setPending(true);
    const { error } = await authClient.signUp.email(input.data);
    if (error) {
      const mapped = toAuthFormError(error);
      if (mapped.field) setErrors({ [mapped.field]: mapped.message });
      else setFormError(mapped);
      setSuggestSignIn(Boolean(mapped.suggestSignIn));
      setPending(false);
      return;
    }

    router.push(safeNextPath(new URLSearchParams(window.location.search).get("next")));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <IconInput
        id="name"
        name="name"
        label="Full name"
        placeholder="Full name"
        icon={UserIcon}
        autoComplete="name"
        maxLength={100}
        required
        error={errors.name}
      />
      <IconInput
        id="email"
        name="email"
        type="email"
        label="Email address"
        placeholder="Email address"
        icon={EnvelopeIcon}
        autoComplete="email"
        required
        error={errors.email}
      />
      {suggestSignIn ? (
        <p className="-mt-1 px-1 text-sm">
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in instead
          </Link>
        </p>
      ) : null}
      <PasswordInput
        id="password"
        name="password"
        label="Password (8+ characters)"
        placeholder="Password (8+ characters)"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
        error={errors.password}
      />
      {formError ? <FormAlert>{formError.message}</FormAlert> : null}
      <SubmitButton pending={pending}>Create account</SubmitButton>
    </form>
  );
}

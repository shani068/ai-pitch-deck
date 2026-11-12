"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/src/auth/client";
import { safeNextPath } from "@/src/auth/redirect";
import { toAuthFormError, type AuthFormError } from "@/src/auth/errors";
import { fieldErrors, SignInSchema, type AuthField } from "@/src/auth/validation";
import { EnvelopeIcon } from "@/src/components/icons";

import { FormAlert } from "./form-alert";
import { IconInput } from "./icon-input";
import { PasswordInput } from "./password-input";
import { SubmitButton } from "./submit-button";

/** Same flow as sign-up. Wrong email and wrong password show one message on purpose. */
export function SignInForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<AuthField, string>>>({});
  const [formError, setFormError] = useState<AuthFormError | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const data = new FormData(event.currentTarget);
    const input = SignInSchema.safeParse({
      email: data.get("email"),
      password: data.get("password"),
    });
    setFormError(null);
    if (!input.success) {
      setErrors(fieldErrors(input.error));
      return;
    }
    setErrors({});

    setPending(true);
    const { error } = await authClient.signIn.email(input.data);
    if (error) {
      const mapped = toAuthFormError(error);
      if (mapped.field) setErrors({ [mapped.field]: mapped.message });
      else setFormError(mapped);
      setPending(false);
      return;
    }

    router.push(safeNextPath(new URLSearchParams(window.location.search).get("next")));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
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
      <PasswordInput
        id="password"
        name="password"
        label="Password"
        placeholder="Password"
        autoComplete="current-password"
        required
        error={errors.password}
      />
      {formError ? <FormAlert>{formError.message}</FormAlert> : null}
      <SubmitButton pending={pending}>Sign in</SubmitButton>
    </form>
  );
}

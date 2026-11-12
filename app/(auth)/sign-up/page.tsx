import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "../_components/auth-shell";
import { SignUpForm } from "../_components/sign-up-form";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Get started in less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="rounded-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}

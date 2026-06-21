import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/public/auth-shell";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your Aurex account email address.",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      eyebrow="Check your inbox"
      title="Verify your email"
      description="Enter the 6-digit code sent to your email address."
      footer="Email verification does not sign you in. You will sign in after verification."
    >
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}

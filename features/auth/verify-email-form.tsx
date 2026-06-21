"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthMutationError, authErrorMessage, fieldError } from "@/features/auth/errors";
import type { ResendEmailBody, VerifyEmailBody } from "@/frontend.types";
import { resendEmail, verifyEmail } from "@/lib/auth-api";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const [form, setForm] = React.useState<VerifyEmailBody>(() => ({
    email: emailFromQuery,
    otp: "",
  }));
  const [cooldown, setCooldown] = React.useState(0);
  const [formError, setFormError] = React.useState<AuthMutationError | null>(
    null,
  );

  React.useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  const verifyMutation = useMutation({
    mutationFn: async (body: VerifyEmailBody) => {
      const result = await verifyEmail(body);

      if (!result.ok) {
        throw new AuthMutationError(result);
      }

      return result;
    },
    onSuccess: (result) => {
      setFormError(null);
      toast.success(result.message);
      window.setTimeout(() => {
        router.push("/login");
      }, 800);
    },
    onError: (error: AuthMutationError) => {
      setFormError(error);
      toast.error(authErrorMessage(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (body: ResendEmailBody) => {
      const result = await resendEmail(body);

      if (!result.ok) {
        throw new AuthMutationError(result);
      }

      return result;
    },
    onSuccess: (result) => {
      setFormError(null);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(result.message);
    },
    onError: (error: AuthMutationError) => {
      setFormError(error);
      toast.error(authErrorMessage(error));
    },
  });

  const resendDisabled =
    verifyMutation.isPending || resendMutation.isPending || cooldown > 0;

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        verifyMutation.mutate({
          email: form.email,
          otp: form.otp,
        });
      }}
    >
      <div className="rounded-sm border border-border bg-background p-4 text-sm text-muted-foreground">
        Verifying <span className="font-semibold text-foreground">{form.email || "your email address"}</span>
      </div>
      <label className="block text-sm font-medium text-foreground">
        Email address
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          aria-invalid={Boolean(fieldError(formError, "email"))}
          aria-describedby={fieldError(formError, "email") ? "verify-email-error" : undefined}
          className="mt-2 h-12 rounded-sm bg-background"
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
        {fieldError(formError, "email") ? (
          <span id="verify-email-error" className="mt-2 block text-xs text-destructive">
            {fieldError(formError, "email")}
          </span>
        ) : null}
      </label>
      <label className="block text-sm font-medium text-foreground">
        6-digit OTP
        <Input
          type="text"
          name="otp"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          minLength={6}
          autoComplete="one-time-code"
          required
          value={form.otp}
          aria-invalid={Boolean(fieldError(formError, "otp"))}
          aria-describedby={fieldError(formError, "otp") ? "verify-otp-error" : undefined}
          className="mt-2 h-12 rounded-sm bg-background text-center font-mono text-lg tracking-[0.35em]"
          onChange={(event) => {
            const nextOtp = event.target.value.replace(/\D/g, "").slice(0, 6);
            setForm((current) => ({ ...current, otp: nextOtp }));
          }}
        />
        {fieldError(formError, "otp") ? (
          <span id="verify-otp-error" className="mt-2 block text-xs text-destructive">
            {fieldError(formError, "otp")}
          </span>
        ) : null}
      </label>
      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {authErrorMessage(formError)}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-12 w-full rounded-sm"
        disabled={verifyMutation.isPending}
      >
        {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
      </Button>
      <div className="flex flex-col gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <Button
          type="button"
          variant="ghost"
          className="h-10 rounded-sm px-3 text-primary"
          disabled={resendDisabled || !form.email}
          onClick={() => resendMutation.mutate({ email: form.email })}
        >
          {resendMutation.isPending
            ? "Sending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend email"}
        </Button>
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </form>
  );
}

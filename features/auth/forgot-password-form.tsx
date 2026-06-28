"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  accountErrorMessage,
  accountFieldError,
} from "@/features/account/account-errors";
import { useForgotPasswordMutation } from "@/features/account/account-hooks";
import { AccountApiError } from "@/lib/account-api";

export function ForgotPasswordForm() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [email, setEmail] = React.useState("");
  const [formError, setFormError] = React.useState<AccountApiError | null>(
    null,
  );

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();

        forgotPasswordMutation.mutate(
          { email },
          {
            onSuccess: (result) => {
              const normalizedEmail = email.trim().toLowerCase();
              setFormError(null);
              toast.success(result.message);
              router.push(
                `/reset-password?email=${encodeURIComponent(normalizedEmail)}`,
              );
            },
            onError: (error) => {
              setFormError(error instanceof AccountApiError ? error : null);
              toast.error(
                accountErrorMessage(
                  error,
                  "Unable to request a password reset. Please try again.",
                ),
              );
            },
          },
        );
      }}
    >
      <label className="block text-sm font-medium text-foreground">
        Email address
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          aria-invalid={Boolean(accountFieldError(formError, "email"))}
          aria-describedby={
            accountFieldError(formError, "email")
              ? "forgot-email-error"
              : undefined
          }
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-12 rounded-sm bg-background"
        />
        {accountFieldError(formError, "email") ? (
          <span id="forgot-email-error" className="mt-2 block text-xs text-destructive">
            {accountFieldError(formError, "email")}
          </span>
        ) : null}
      </label>
      <Button
        type="submit"
        className="h-12 w-full rounded-sm"
        disabled={forgotPasswordMutation.isPending}
      >
        {forgotPasswordMutation.isPending ? "Sending..." : "Send reset code"}
      </Button>
    </form>
  );
}

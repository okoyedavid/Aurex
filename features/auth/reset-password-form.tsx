"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  accountErrorMessage,
  accountFieldError,
} from "@/features/account/account-errors";
import { useResetPasswordMutation } from "@/features/account/account-hooks";
import { AccountApiError } from "@/lib/account-api";

function validateNewPassword(password: string) {
  if (password.length < 8 || password.length > 72) {
    return "New password must be 8 to 72 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "New password must include at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "New password must include at least one lowercase letter.";
  }

  if (!/\d/.test(password)) {
    return "New password must include at least one number.";
  }

  return null;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();
  const [formError, setFormError] = React.useState<AccountApiError | null>(
    null,
  );
  const [form, setForm] = React.useState(() => ({
    email: searchParams.get("email") ?? "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  }));

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();

        if (!/^\d{6}$/.test(form.otp)) {
          toast.error("Enter the 6-digit reset code.");
          return;
        }

        const passwordError = validateNewPassword(form.newPassword);

        if (passwordError) {
          toast.error(passwordError);
          return;
        }

        if (form.newPassword !== form.confirmPassword) {
          toast.error("New password and confirmation do not match.");
          return;
        }

        resetPasswordMutation.mutate(
          {
            email: form.email,
            otp: form.otp,
            newPassword: form.newPassword,
          },
          {
            onSuccess: (result) => {
              setFormError(null);
              toast.success(result.message);
              router.push("/login");
            },
            onError: (error) => {
              setFormError(error instanceof AccountApiError ? error : null);
              toast.error(
                accountErrorMessage(
                  error,
                  "Unable to reset password. Please try again.",
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
          value={form.email}
          aria-invalid={Boolean(accountFieldError(formError, "email"))}
          aria-describedby={
            accountFieldError(formError, "email")
              ? "reset-email-error"
              : undefined
          }
          onChange={(event) => updateField("email", event.target.value)}
          className="mt-2 h-12 rounded-sm bg-background"
        />
        {accountFieldError(formError, "email") ? (
          <span id="reset-email-error" className="mt-2 block text-xs text-destructive">
            {accountFieldError(formError, "email")}
          </span>
        ) : null}
      </label>
      <label className="block text-sm font-medium text-foreground">
        6-digit code
        <Input
          type="text"
          name="otp"
          inputMode="numeric"
          pattern="[0-9]{6}"
          minLength={6}
          maxLength={6}
          autoComplete="one-time-code"
          required
          value={form.otp}
          aria-invalid={Boolean(accountFieldError(formError, "otp"))}
          aria-describedby={
            accountFieldError(formError, "otp")
              ? "reset-otp-error"
              : undefined
          }
          onChange={(event) =>
            updateField("otp", event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="mt-2 h-12 rounded-sm bg-background text-center font-mono tracking-[0.35em]"
        />
        {accountFieldError(formError, "otp") ? (
          <span id="reset-otp-error" className="mt-2 block text-xs text-destructive">
            {accountFieldError(formError, "otp")}
          </span>
        ) : null}
      </label>
      <div className="block text-sm font-medium text-foreground">
        <label htmlFor="reset-new-password">New password</label>
        <PasswordInput
          id="reset-new-password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={form.newPassword}
          aria-invalid={Boolean(accountFieldError(formError, "newPassword"))}
          aria-describedby={
            accountFieldError(formError, "newPassword")
              ? "reset-password-error"
              : undefined
          }
          onChange={(event) => updateField("newPassword", event.target.value)}
          className="h-12 rounded-sm bg-background"
        />
        {accountFieldError(formError, "newPassword") ? (
          <span id="reset-password-error" className="mt-2 block text-xs text-destructive">
            {accountFieldError(formError, "newPassword")}
          </span>
        ) : null}
      </div>
      <div className="block text-sm font-medium text-foreground">
        <label htmlFor="reset-confirm-password">Confirm password</label>
        <PasswordInput
          id="reset-confirm-password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={form.confirmPassword}
          onChange={(event) =>
            updateField("confirmPassword", event.target.value)
          }
          className="h-12 rounded-sm bg-background"
        />
      </div>
      <Button
        type="submit"
        className="h-12 w-full rounded-sm"
        disabled={resetPasswordMutation.isPending}
      >
        {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}

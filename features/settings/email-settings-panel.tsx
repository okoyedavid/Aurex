"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  accountErrorMessage,
  accountFieldError,
} from "@/features/account/account-errors";
import {
  useRequestEmailChangeMutation,
  useVerifyEmailChangeMutation,
} from "@/features/account/account-hooks";
import { useMeQuery } from "@/features/auth/use-me-query";
import { SettingsSection } from "@/features/settings/settings-section";
import { AccountApiError } from "@/lib/account-api";

export function EmailSettingsPanel() {
  const userQuery = useMeQuery();
  const requestEmailChangeMutation = useRequestEmailChangeMutation();
  const verifyEmailChangeMutation = useVerifyEmailChangeMutation();
  const [newEmail, setNewEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpVisible, setOtpVisible] = React.useState(false);
  const [emailError, setEmailError] = React.useState<AccountApiError | null>(
    null,
  );
  const currentEmail = userQuery.data?.email ?? "";

  return (
    <SettingsSection
      id="email"
      title="Email"
      description="Update your account email with OTP verification."
      icon={Mail}
    >
      <div className="space-y-5">
        <label className="block text-sm font-medium text-foreground">
          Current email
          <Input
            type="email"
            value={currentEmail}
            disabled
            readOnly
            className="mt-2 h-11 rounded-md bg-muted"
          />
        </label>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const normalizedNewEmail = newEmail.trim().toLowerCase();

            if (!normalizedNewEmail) {
              toast.error("Enter the new email address.");
              return;
            }

            if (normalizedNewEmail === currentEmail.trim().toLowerCase()) {
              toast.error("New email must be different from your current email.");
              return;
            }

            requestEmailChangeMutation.mutate(
              { newEmail: normalizedNewEmail },
              {
                onSuccess: (result) => {
                  setEmailError(null);
                  toast.success(result.message);
                  setOtpVisible(true);
                },
                onError: (error) => {
                  setEmailError(error instanceof AccountApiError ? error : null);
                  toast.error(
                    accountErrorMessage(
                      error,
                      "Unable to update email. Please try again.",
                    ),
                  );
                },
              },
            );
          }}
        >
          <label className="block text-sm font-medium text-foreground">
            New email
            <Input
              type="email"
              name="newEmail"
              autoComplete="email"
              value={newEmail}
              aria-invalid={Boolean(accountFieldError(emailError, "newEmail"))}
              aria-describedby={
                accountFieldError(emailError, "newEmail")
                  ? "email-new-error"
                  : undefined
              }
              onChange={(event) => setNewEmail(event.target.value)}
              className="mt-2 h-11 rounded-md bg-background"
            />
            {accountFieldError(emailError, "newEmail") ? (
              <span id="email-new-error" className="mt-2 block text-xs text-destructive">
                {accountFieldError(emailError, "newEmail")}
              </span>
            ) : null}
          </label>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-10 rounded-md px-5"
              disabled={requestEmailChangeMutation.isPending}
            >
              {requestEmailChangeMutation.isPending
                ? "Sending..."
                : "Update email"}
            </Button>
          </div>
        </form>

        {otpVisible ? (
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">
              Verify email change
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the 6-digit code sent to {newEmail.trim().toLowerCase()}.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="block text-sm font-medium text-foreground">
                6-digit code
                <Input
                  name="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  value={otp}
                  aria-invalid={Boolean(accountFieldError(emailError, "otp"))}
                  aria-describedby={
                    accountFieldError(emailError, "otp")
                      ? "email-otp-error"
                      : undefined
                  }
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="mt-2 h-11 rounded-md bg-background font-mono tracking-[0.35em]"
                />
                {accountFieldError(emailError, "otp") ? (
                  <span id="email-otp-error" className="mt-2 block text-xs text-destructive">
                    {accountFieldError(emailError, "otp")}
                  </span>
                ) : null}
              </label>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  className="h-11 rounded-md px-4"
                  disabled={verifyEmailChangeMutation.isPending}
                  onClick={() => {
                    verifyEmailChangeMutation.mutate(
                      { otp },
                      {
                        onSuccess: (result) => {
                          setEmailError(null);
                          toast.success(result.message);
                          setNewEmail("");
                          setOtp("");
                          setOtpVisible(false);
                        },
                        onError: (error) => {
                          setEmailError(
                            error instanceof AccountApiError ? error : null,
                          );
                          toast.error(
                            accountErrorMessage(
                              error,
                              "Unable to verify email. Please try again.",
                            ),
                          );
                        },
                      },
                    );
                  }}
                >
                  {verifyEmailChangeMutation.isPending ? "Verifying..." : "Verify"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-md px-4"
                  disabled={requestEmailChangeMutation.isPending}
                  onClick={() => {
                    requestEmailChangeMutation.mutate(
                      { newEmail: newEmail.trim().toLowerCase() },
                      {
                        onSuccess: (result) => {
                          setEmailError(null);
                          toast.success(result.message);
                        },
                        onError: (error) => {
                          setEmailError(
                            error instanceof AccountApiError ? error : null,
                          );
                          toast.error(
                            accountErrorMessage(
                              error,
                              "Unable to resend email code. Please try again.",
                            ),
                          );
                        },
                      },
                    );
                  }}
                >
                  Resend
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 rounded-md px-4"
                  disabled={verifyEmailChangeMutation.isPending}
                  onClick={() => {
                    setOtp("");
                    setOtpVisible(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </SettingsSection>
  );
}

"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  accountErrorMessage,
  accountFieldError,
} from "@/features/account/account-errors";
import { useChangePasswordMutation } from "@/features/account/account-hooks";
import { SettingsSection } from "@/features/settings/settings-section";
import { AccountApiError } from "@/lib/account-api";

export function SecuritySettingsPanel() {
  const changePasswordMutation = useChangePasswordMutation();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<AccountApiError | null>(
    null,
  );

  function updatePasswordField(field: keyof typeof passwords, value: string) {
    setPasswords((current) => ({ ...current, [field]: value }));
  }

  return (
    <SettingsSection
      id="password"
      title="Password"
      description="Update the password used to access your Aurex account."
      icon={KeyRound}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New password and confirmation do not match.");
            return;
          }

          changePasswordMutation.mutate(
            {
              currentPassword: passwords.currentPassword,
              newPassword: passwords.newPassword,
            },
            {
              onSuccess: (result) => {
                setPasswordError(null);
                toast.success(result.message);
                setPasswords({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              },
              onError: (error) => {
                setPasswordError(
                  error instanceof AccountApiError ? error : null,
                );
                toast.error(
                  accountErrorMessage(
                    error,
                    "Unable to update password. Please try again.",
                  ),
                );
              },
            },
          );
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="text-sm font-medium text-foreground sm:col-span-2">
            <label htmlFor="current-password">Current password</label>
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              aria-invalid={Boolean(
                accountFieldError(passwordError, "currentPassword"),
              )}
              aria-describedby={
                accountFieldError(passwordError, "currentPassword")
                  ? "current-password-error"
                  : undefined
              }
              onChange={(event) =>
                updatePasswordField("currentPassword", event.target.value)
              }
              className="h-11 rounded-md bg-background"
            />
            {accountFieldError(passwordError, "currentPassword") ? (
              <span id="current-password-error" className="mt-2 block text-xs text-destructive">
                {accountFieldError(passwordError, "currentPassword")}
              </span>
            ) : null}
          </div>
          <div className="text-sm font-medium text-foreground">
            <label htmlFor="new-password">New password</label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={passwords.newPassword}
              aria-invalid={Boolean(
                accountFieldError(passwordError, "newPassword"),
              )}
              aria-describedby={
                accountFieldError(passwordError, "newPassword")
                  ? "new-password-error"
                  : undefined
              }
              onChange={(event) =>
                updatePasswordField("newPassword", event.target.value)
              }
              className="h-11 rounded-md bg-background"
            />
            {accountFieldError(passwordError, "newPassword") ? (
              <span id="new-password-error" className="mt-2 block text-xs text-destructive">
                {accountFieldError(passwordError, "newPassword")}
              </span>
            ) : null}
          </div>
          <div className="text-sm font-medium text-foreground">
            <label htmlFor="confirm-password">Confirm password</label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={passwords.confirmPassword}
              onChange={(event) =>
                updatePasswordField("confirmPassword", event.target.value)
              }
              className="h-11 rounded-md bg-background"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            className="h-10 rounded-md px-5"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending
              ? "Updating..."
              : "Update password"}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

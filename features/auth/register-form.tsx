"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { register } from "@/lib/auth-api";
import type { RegisterBody } from "@/frontend.types";
import { AuthDivider } from "@/features/auth/auth-divider";
import { AuthMutationError, authErrorMessage, fieldError } from "@/features/auth/errors";
import { GoogleAuthButton } from "@/features/auth/google-auth-button";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = React.useState<RegisterBody>({
    name: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = React.useState<AuthMutationError | null>(
    null,
  );

  const mutation = useMutation({
    mutationFn: async (body: RegisterBody) => {
      const result = await register(body);

      if (!result.ok) {
        throw new AuthMutationError(result);
      }

      return result;
    },
    onSuccess: (result) => {
      setFormError(null);
      toast.success(result.message);
      router.push(`/verify-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
    },
    onError: (error: AuthMutationError) => {
      setForm((current) => ({ ...current, password: "" }));
      setFormError(error);
      toast.error(authErrorMessage(error));
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(form);
      }}
    >
      <GoogleAuthButton>Sign up with Google</GoogleAuthButton>
      <AuthDivider />
      <label className="block text-sm font-medium text-foreground">
        Full name
        <Input
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={50}
          value={form.name}
          aria-invalid={Boolean(fieldError(formError, "name"))}
          aria-describedby={fieldError(formError, "name") ? "register-name-error" : undefined}
          className="mt-2 h-12 rounded-sm bg-background"
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
        />
        {fieldError(formError, "name") ? (
          <span id="register-name-error" className="mt-2 block text-xs text-destructive">
            {fieldError(formError, "name")}
          </span>
        ) : null}
      </label>
      <label className="block text-sm font-medium text-foreground">
        Work email
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          aria-invalid={Boolean(fieldError(formError, "email"))}
          aria-describedby={fieldError(formError, "email") ? "register-email-error" : undefined}
          className="mt-2 h-12 rounded-sm bg-background"
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
        {fieldError(formError, "email") ? (
          <span id="register-email-error" className="mt-2 block text-xs text-destructive">
            {fieldError(formError, "email")}
          </span>
        ) : null}
      </label>
      <div className="block text-sm font-medium text-foreground">
        <label htmlFor="register-password">Password</label>
        <PasswordInput
          id="register-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={form.password}
          aria-invalid={Boolean(fieldError(formError, "password"))}
          aria-describedby={
            fieldError(formError, "password")
              ? "register-password-error"
              : "register-password-help"
          }
          className="h-12 rounded-sm bg-background"
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
        />
        {fieldError(formError, "password") ? (
          <span id="register-password-error" className="mt-2 block text-xs text-destructive">
            {fieldError(formError, "password")}
          </span>
        ) : (
          <span id="register-password-help" className="mt-2 block text-xs text-muted-foreground">
            Use 8-72 characters with uppercase, lowercase, and a number.
          </span>
        )}
      </div>
      {formError?.result.error.details?.formErrors?.[0] ? (
        <p className="text-sm text-destructive" role="alert">
          {formError.result.error.details.formErrors[0]}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-12 w-full rounded-sm"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}

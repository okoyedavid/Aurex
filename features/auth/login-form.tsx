"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthDivider } from "@/features/auth/auth-divider";
import {
  AuthMutationError,
  authErrorMessage,
  fieldError,
} from "@/features/auth/errors";
import { GoogleAuthButton } from "@/features/auth/google-auth-button";
import type { LoginBody } from "@/frontend.types";
import { login } from "@/lib/auth-api";
import { useAuthHandoff } from "@/components/auth-handoff-provider";

export function LoginForm() {
  const router = useRouter();
  const { handoff, clear } = useAuthHandoff();
  const [form, setForm] = React.useState<LoginBody>(() => ({
    email: handoff?.email ?? "",
    password: handoff?.password ?? "",
  }));
  const [formError, setFormError] = React.useState<AuthMutationError | null>(
    null,
  );

  React.useEffect(() => () => clear(), [clear]);

  const mutation = useMutation({
    mutationFn: async (body: LoginBody) => {
      const result = await login(body);

      if (!result.ok) {
        throw new AuthMutationError(result);
      }

      return result;
    },
    onSuccess: (result) => {
      setFormError(null);
      toast.success(result.message);
      router.push("/dashboard");
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
      <GoogleAuthButton>Sign in with Google</GoogleAuthButton>
      <AuthDivider />
      <label className="block text-sm font-medium text-foreground">
        Email address
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          aria-invalid={Boolean(fieldError(formError, "email"))}
          aria-describedby={
            fieldError(formError, "email") ? "login-email-error" : undefined
          }
          className="mt-2 h-12 rounded-sm bg-background"
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
        {fieldError(formError, "email") ? (
          <span
            id="login-email-error"
            className="mt-2 block text-xs text-destructive"
          >
            {fieldError(formError, "email")}
          </span>
        ) : null}
      </label>
      <div className="block text-sm font-medium text-foreground">
        <span className="flex items-center justify-between gap-4">
          <label htmlFor="login-password">Password</label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </span>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
          value={form.password}
          aria-invalid={Boolean(fieldError(formError, "password"))}
          aria-describedby={
            fieldError(formError, "password")
              ? "login-password-error"
              : undefined
          }
          className="h-12 rounded-sm bg-background"
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
        />
        {fieldError(formError, "password") ? (
          <span
            id="login-password-error"
            className="mt-2 block text-xs text-destructive"
          >
            {fieldError(formError, "password")}
          </span>
        ) : null}
      </div>
      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {authErrorMessage(formError)}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-12 w-full rounded-sm"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

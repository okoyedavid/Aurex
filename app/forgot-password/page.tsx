import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/public/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request an Aurex password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter the email associated with your account. If it matches a workspace, we will send reset instructions."
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Return to sign in
        </Link>
      }
    >
      <form className="space-y-5">
        <label className="block text-sm font-medium text-foreground">
          Email address
          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="mt-2 h-12 rounded-sm bg-background"
          />
        </label>
        <Button type="submit" className="h-12 w-full rounded-sm">
          Send Reset Link
        </Button>
      </form>
    </AuthShell>
  );
}

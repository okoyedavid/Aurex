import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/public/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Aurex workspace.",
};

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Aurex"
      description="Access your business payment workspace."
      footer={
        <>
          New to Aurex?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
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
        <label className="block text-sm font-medium text-foreground">
          <span className="flex items-center justify-between gap-4">
            Password
            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </span>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="mt-2 h-12 rounded-sm bg-background"
          />
        </label>
        <Button type="submit" className="h-12 w-full rounded-sm">
          Sign In
        </Button>
      </form>
    </AuthShell>
  );
}

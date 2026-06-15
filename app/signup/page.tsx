import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/public/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an Aurex business payments account.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      description="Set up a secure workspace for your business payment operations."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5">
        <label className="block text-sm font-medium text-foreground">
          Full name
          <Input
            name="name"
            autoComplete="name"
            required
            className="mt-2 h-12 rounded-sm bg-background"
          />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Work email
          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="mt-2 h-12 rounded-sm bg-background"
          />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Password
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="mt-2 h-12 rounded-sm bg-background"
          />
          <span className="mt-2 block text-xs text-muted-foreground">
            Use at least 8 characters.
          </span>
        </label>
        <Button type="submit" className="h-12 w-full rounded-sm">
          Create Account
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          By continuing, you agree to the{" "}
          <Link href="/terms" className="font-semibold text-foreground hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-foreground hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}

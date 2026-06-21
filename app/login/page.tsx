import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/public/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Aurex workspace.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Aurex"
      description="Access your business payment workspace."
      footer={
        <>
          New to Aurex?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}

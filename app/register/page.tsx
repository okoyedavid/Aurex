import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/public/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an Aurex business payments account.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      description="Set up a secure workspace for your business payment operations."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

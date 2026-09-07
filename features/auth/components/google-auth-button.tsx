"use client";

import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getGoogleAuthUrl } from "@/lib/auth-api";

type GoogleAuthButtonProps = {
  children: React.ReactNode;
};

export function GoogleAuthButton({ children }: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full rounded-sm"
      onClick={() => {
        try {
          window.location.assign(getGoogleAuthUrl());
        } catch {
          toast.error("Google login is unavailable. Please try again later.");
        }
      }}
    >
      <FcGoogle aria-hidden="true" />
      {children}
    </Button>
  );
}


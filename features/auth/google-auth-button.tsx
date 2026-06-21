"use client";

import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
        toast.info("Google authentication is not connected yet.");
      }}
    >
      <FcGoogle aria-hidden="true" />
      {children}
    </Button>
  );
}

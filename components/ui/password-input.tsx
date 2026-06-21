"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative mt-2">
      <Input
        type={isVisible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}

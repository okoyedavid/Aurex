"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authKeys, getMe } from "@/lib/me-api";

export type GoogleCallbackResult = "success" | "error" | null;

export function getGoogleCallbackResult(url: string): GoogleCallbackResult {
  const value = new URL(url).searchParams.get("google");
  return value === "success" || value === "error" ? value : null;
}

export function removeGoogleCallbackResult(url: string) {
  const next = new URL(url);
  next.searchParams.delete("google");
  return `${next.pathname}${next.search}${next.hash}`;
}

export function GoogleAuthCallback() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const handledUrl = React.useRef<string | null>(null);

  React.useEffect(() => {
    const callbackUrl = window.location.href;
    const result = getGoogleCallbackResult(callbackUrl);

    if (!result || handledUrl.current === callbackUrl) return;
    handledUrl.current = callbackUrl;
    window.history.replaceState(
      window.history.state,
      "",
      removeGoogleCallbackResult(callbackUrl),
    );

    if (result === "error") {
      toast.error("Google login could not be completed");
      return;
    }

    void getMe()
      .then((user) => {
        queryClient.setQueryData(authKeys.me(), user);
        toast.success("Signed in with Google");
        router.replace("/dashboard");
        router.refresh();
      })
      .catch(() => {
        queryClient.removeQueries({ queryKey: authKeys.all });
        toast.error("Google login could not be completed");
      });
  }, [queryClient, router]);

  return null;
}


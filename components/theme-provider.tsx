"use client";

import { useEffect } from "react";

import { applyTheme, getStoredTheme } from "@/lib/theme";

export function ScopedThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyStoredTheme = () => applyTheme(getStoredTheme());

    applyStoredTheme();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };
    const handleStoredThemeChange = (event: StorageEvent) => {
      if (event.key === "aurex-theme") {
        applyStoredTheme();
      }
    };

    media.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStoredThemeChange);

    return () => {
      media.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStoredThemeChange);
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return children;
}

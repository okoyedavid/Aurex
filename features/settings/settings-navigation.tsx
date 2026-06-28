"use client";

import {
  BellRing,
  Building2,
  KeyRound,
  Mail,
  MonitorSmartphone,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

const personalSettingsNavigation = [
  { label: "Profile", id: "profile", href: "#profile", icon: UserRound },
  { label: "Email", id: "email", href: "#email", icon: Mail },
  { label: "Password", id: "password", href: "#password", icon: KeyRound },
  {
    label: "Sessions",
    id: "sessions",
    href: "#sessions",
    icon: MonitorSmartphone,
  },
  {
    label: "Preferences",
    id: "preferences",
    href: "#preferences",
    icon: BellRing,
  },
];
const businessSettingsNavigation = [
  { label: "Business", id: "business", href: "#business", icon: Building2 },
  { label: "Team access", id: "team", href: "#team", icon: UsersRound },
];

export default function SettingsNavigation({
  scope,
}: {
  scope: "personal" | "business";
}) {
  const settingsNavigation =
    scope === "business"
      ? businessSettingsNavigation
      : personalSettingsNavigation;
  const [activeSection, setActiveSection] = useState(
    settingsNavigation[0].id,
  );

  useEffect(() => {
    const sections = settingsNavigation
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const mostVisible = visibleEntries[0];

        if (mostVisible?.target.id) {
          setActiveSection(mostVisible.target.id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [settingsNavigation]);

  return (
    <nav
        aria-label="Settings sections"
        className="flex gap-2 overflow-x-auto pb-2 xl:sticky xl:top-24 xl:block xl:self-start xl:overflow-visible xl:pb-0"
      >
        {settingsNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? "true" : undefined}
              onClick={() => setActiveSection(item.id)}
              className={[
                "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition xl:mb-1 xl:w-full",
                isActive
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground xl:border-transparent xl:bg-transparent",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </a>
          );
        })}
    </nav>
  );
}

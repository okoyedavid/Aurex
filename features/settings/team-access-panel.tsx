"use client";

import { UserPlus, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/features/settings/hooks";
import { SettingsSection } from "@/features/settings/settings-section";
import type { UserRole } from "@/features/settings/types";
import { cn } from "@/lib/utils";

const roleStyles: Record<UserRole, string> = {
  Owner: "bg-primary/10 text-primary",
  Admin: "bg-secondary text-secondary-foreground",
  Finance: "bg-accent text-accent-foreground",
  Viewer: "bg-muted text-muted-foreground",
};

export function TeamAccessPanel() {
  const { data } = useSettings();

  return (
    <SettingsSection
      id="team"
      title="Team and access"
      description="Preview workspace membership and role assignments."
      icon={UsersRound}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">
            {data.teamMembers.length} workspace members
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Full invitations, role changes, and permission controls will be
            connected to your team-management backend later.
          </p>
        </div>
        <Button type="button" className="h-10 shrink-0 rounded-md">
          <UserPlus className="h-4 w-4" />
          Invite member
        </Button>
      </div>

      <div className="mt-6 divide-y divide-border border-y border-border">
        {data.teamMembers.map((member) => (
          <article
            key={member.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {member.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {member.name}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-[52px] sm:pl-0">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  roleStyles[member.role],
                )}
              >
                {member.role}
              </span>
              <span className="text-xs text-muted-foreground">
                {member.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </SettingsSection>
  );
}

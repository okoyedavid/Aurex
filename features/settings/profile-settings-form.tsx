"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/settings/hooks";
import { SettingsSection } from "@/features/settings/settings-section";

export function ProfileSettingsForm() {
  const { data: user } = useCurrentUser();
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <SettingsSection
      id="profile"
      title="Profile settings"
      description="Manage the personal information associated with your Aurex account."
      icon={UserRound}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          // TODO(auth): Persist profile changes through the migrated user API.
        }}
      >
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {user.initials}
          </div>
          <div>
            <p className="font-semibold text-foreground">Profile image</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Avatar uploads can be connected to your user storage later.
            </p>
            <Button type="button" variant="outline" className="mt-3 h-9 rounded-md">
              Upload image
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-foreground">
            Full name
            <Input
              name="fullName"
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className="mt-2 h-11 rounded-md bg-background"
            />
          </label>
          <label className="text-sm font-medium text-foreground">
            Email address
            <Input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="mt-2 h-11 rounded-md bg-background"
            />
          </label>
          <label className="text-sm font-medium text-foreground">
            Phone number
            <Input
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              value={form.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
              className="mt-2 h-11 rounded-md bg-background"
            />
          </label>
          <label className="text-sm font-medium text-foreground">
            Role
            <Input
              value={user.role}
              readOnly
              aria-readonly="true"
              className="mt-2 h-11 rounded-md bg-muted"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" className="h-10 rounded-md px-5">
            Save changes
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

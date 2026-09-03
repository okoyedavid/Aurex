"use client";

import { SelectControl } from "@/components/ui/select";

import { useState } from "react";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsSection } from "@/features/settings/settings-section";
import type { Business } from "@/types/generic";

export function BusinessSettingsForm({ business }: { business: Business }) {
  const [form, setForm] = useState({
    name: business.name,
    email: "",
    industry: business.industry,
    country: "Nigeria",
    defaultCurrency: business.defaultCurrency,
    address: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <SettingsSection
      id="business"
      title="Business settings"
      description="Control the organization details used across invoices, payments, and reports."
      icon={Building2}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          // TODO(api): Persist organization changes to the business settings API.
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-foreground">
            Business name
            <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} className="mt-2 h-11 rounded-md bg-background" />
          </label>
          <label className="text-sm font-medium text-foreground">
            Business email
            <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="mt-2 h-11 rounded-md bg-background" />
          </label>
          <label className="text-sm font-medium text-foreground">
            Industry
            <Input value={form.industry} onChange={(e) => updateField("industry", e.target.value)} className="mt-2 h-11 rounded-md bg-background" />
          </label>
          <label className="text-sm font-medium text-foreground">
            Country
            <SelectControl value={form.country} onChange={(e) => updateField("country", e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
              <option>Nigeria</option>
              <option>Ghana</option>
              <option>Kenya</option>
              <option>United Kingdom</option>
              <option>United States</option>
            </SelectControl>
          </label>
          <label className="text-sm font-medium text-foreground">
            Default currency
            <SelectControl value={form.defaultCurrency} onChange={(e) => updateField("defaultCurrency", e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="EUR">EUR - Euro</option>
            </SelectControl>
          </label>
          <label className="text-sm font-medium text-foreground sm:col-span-2">
            Business address
            <Textarea value={form.address} onChange={(e) => updateField("address", e.target.value)} className="mt-2 min-h-24 rounded-md bg-background" />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" className="h-10 rounded-md px-5">Save changes</Button>
        </div>
      </form>
    </SettingsSection>
  );
}

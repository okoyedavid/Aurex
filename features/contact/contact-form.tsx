"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/public-api";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      method="post"
      className="bg-card p-6 shadow-lg ring-1 ring-foreground/10 sm:p-10"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setIsSubmitting(true);

        try {
          const message = await sendContactMessage({
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            company: String(data.get("company") ?? ""),
            message: String(data.get("message") ?? ""),
          });
          form.reset();
          toast.success(message);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to send your message.",
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-card-foreground">
          Send a message
        </h2>
      </div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">
          Name
          <Input
            name="name"
            autoComplete="name"
            required
            className="mt-2 h-11 rounded-sm bg-background"
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          Work email
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 h-11 rounded-sm bg-background"
          />
        </label>
        <label className="text-sm font-medium text-foreground sm:col-span-2">
          Company
          <Input
            name="company"
            autoComplete="organization"
            className="mt-2 h-11 rounded-sm bg-background"
          />
        </label>
        <label className="text-sm font-medium text-foreground sm:col-span-2">
          How can we help?
          <Textarea
            name="message"
            required
            className="mt-2 rounded-sm bg-background"
          />
        </label>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 h-12 rounded-full px-7"
      >
        {isSubmitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}

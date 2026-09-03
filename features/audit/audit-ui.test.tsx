import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { AuditItem } from "@/lib/audit-api";
import { AuditTimeline } from "./business-audit-page";

const event = (values: Partial<AuditItem> = {}): AuditItem => ({
  id: "audit-1",
  occurredAt: "2026-09-02T09:42:00.000Z",
  domain: "member",
  auditType: "membership",
  action: "business.member.role_updated",
  actor: { type: "member", displayName: "Ada Admin" },
  subject: { type: "member", displayName: "David Okafor" },
  summary: "Role updated: David Okafor",
  changes: [{ field: "role", before: "Viewer", after: "Manager" }],
  ...values,
});

describe("audit timeline", () => {
  it("renders actor and subject separately with semantic time", () => {
    const markup = renderToStaticMarkup(<AuditTimeline items={[event()]} />);
    expect(markup).toContain("Ada Admin");
    expect(markup).toContain("David Okafor");
    expect(markup).toContain("<time");
    expect(markup).toContain('aria-expanded="false"');
  });

  it("omits null actor and subject without inventing identities", () => {
    const markup = renderToStaticMarkup(<AuditTimeline items={[event({ actor: null, subject: null })]} />);
    expect(markup).not.toContain("System");
    expect(markup).not.toContain("Actor</dt>");
    expect(markup).not.toContain("Subject</dt>");
  });

  it("renders personal policy effects without configuration controls", () => {
    const markup = renderToStaticMarkup(<AuditTimeline items={[event({ domain: "policy", auditType: "personal", summary: "Remote Work was assigned to you.", changes: undefined })]} />);
    expect(markup).toContain("Remote Work was assigned to you.");
    expect(markup).not.toContain("policy conditions");
    expect(markup).not.toContain("Manage policy");
  });

  it("uses responsive cards rather than a wide audit table", () => {
    const markup = renderToStaticMarkup(<AuditTimeline items={[event()]} />);
    expect(markup).toContain("sm:grid-cols-2");
    expect(markup).not.toContain("min-w-[");
    expect(markup).not.toContain("metadata");
  });
});

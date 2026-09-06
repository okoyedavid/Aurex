import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { AuditItem } from "@/lib/audit-api";
import { AuditActivityTimeline } from "../audit-activity-timeline";

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
  it("renders a complete business event title with semantic time", () => {
    const markup = renderToStaticMarkup(
      <AuditActivityTimeline items={[event()]} scope="organization" />,
    );
    expect(markup).toContain("Ada Admin changed David Okafor&#x27;s role");
    expect(markup).toContain("<time");
    expect(markup).toContain("View changes");
    expect(markup).not.toContain("Actor</dt>");
    expect(markup).not.toContain("Subject</dt>");
  });

  it("omits null actor and subject without inventing identities", () => {
    const markup = renderToStaticMarkup(
      <AuditActivityTimeline
        items={[event({ actor: null, subject: null })]}
        scope="organization"
      />,
    );
    expect(markup).not.toContain("System");
    expect(markup).toContain("A member&#x27;s role was changed");
  });

  it("renders personal policy effects without configuration controls", () => {
    const markup = renderToStaticMarkup(
      <AuditActivityTimeline
        scope="personal"
        items={[
          event({
            domain: "policy",
            auditType: "personal",
            action: "ASSIGNMENT_CREATED",
            summary: "Remote Work was assigned to you.",
            changes: undefined,
          }),
        ]}
      />,
    );
    expect(markup).toContain("Remote Work was assigned to you.");
    expect(markup).not.toContain("policy conditions");
    expect(markup).not.toContain("Manage policy");
  });

  it("uses connected rails rather than cards or a wide table", () => {
    const markup = renderToStaticMarkup(
      <AuditActivityTimeline
        items={[event(), event({ id: "audit-2" })]}
        scope="organization"
      />,
    );
    expect(markup).toContain("-bottom-1.5");
    expect(markup).not.toContain("shadow-sm");
    expect(markup).not.toContain("<table");
  });
});

import { describe, expect, it } from "vitest";

import { auditKeys } from "./audit-hooks";
import {
  auditFiltersFromSearch,
  auditQueryAccess,
  displayAuditValue,
  humanizeAuditField,
  resolveAuditScope,
  retryAuditQuery,
  updateAuditSearch,
  visibleAuditDomains,
} from "./audit-utils";
import { BusinessApiError } from "@/lib/business-api";

describe("audit presentation and query state", () => {
  it("falls back to personal activity without organization permission", () => {
    expect(resolveAuditScope("organization", false)).toBe("me");
    expect(auditQueryAccess("me", false)).toEqual({ organization: false, personal: true });
  });

  it("enables organization activity only with audit permission", () => {
    expect(resolveAuditScope(null, true)).toBe("organization");
    expect(auditQueryAccess("organization", true)).toEqual({ organization: true, personal: false });
  });

  it("hides the policy domain without policy audit permission", () => {
    expect(visibleAuditDomains(false)).not.toContain("policy");
    expect(visibleAuditDomains(true)).toContain("policy");
  });

  it("restores all organization filters from URL state", () => {
    const filters = auditFiltersFromSearch(new URLSearchParams("page=4&limit=50&domain=employee&action=updated&actorId=a1&employeeId=e1&from=start&to=end"));
    expect(filters).toEqual({ page: 4, limit: 50, domain: "employee", action: "updated", actorId: "a1", employeeId: "e1", from: "start", to: "end" });
  });

  it("resets pagination when a filter changes", () => {
    const next = updateAuditSearch(new URLSearchParams("page=8&domain=member"), { domain: "employee" });
    expect(next.get("page")).toBeNull();
    expect(next.get("domain")).toBe("employee");
  });

  it("separates scopes and businesses in query keys", () => {
    expect(auditKeys.organization("business-1", { page: 1, limit: 20 })).not.toEqual(auditKeys.personal("business-1", 1, 20));
    expect(auditKeys.organization("business-1", { page: 1, limit: 20 })).not.toEqual(auditKeys.organization("business-2", { page: 1, limit: 20 }));
  });

  it("does not retry known authorization failures", () => {
    expect(retryAuditQuery(0, new BusinessApiError(403, { message: "Denied" }))).toBe(false);
  });

  it("humanizes fields and safely redacts non-primitive values", () => {
    expect(humanizeAuditField("roleUpdatedAt")).toBe("Role Updated At");
    expect(displayAuditValue(null)).toBe("Not set");
    expect(displayAuditValue("[changed]")).toBe("Changed (details redacted)");
    expect(displayAuditValue({ secret: true })).toBe("Changed (details redacted)");
  });
});

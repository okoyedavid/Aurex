import { describe, expect, it } from "vitest";

import {
  canAccessBusinessNavigationItem,
  getBusinessRouteAuthorization,
} from "../data";
import type { Permission } from "@/types/generic";

const route = (path: string, permissions: Permission[]) => {
  const authorization = getBusinessRouteAuthorization("business-1", path);
  return authorization
    ? canAccessBusinessNavigationItem(authorization, new Set(permissions))
    : false;
};

describe("business route authorization", () => {
  it("authorizes invites for either supported activity", () => {
    expect(route("/business/business-1/invites", ["members:invite"])).toBe(true);
    expect(route("/business/business-1/invites", ["roles:assign"])).toBe(true);
    expect(route("/business/business-1/invites", [])).toBe(false);
  });

  it("keeps integration access independent from business settings", () => {
    expect(route("/business/business-1/settings/integrations", ["integrations:view"])).toBe(true);
    expect(route("/business/business-1/settings/integrations", ["integrations:manage"])).toBe(true);
    expect(route("/business/business-1/settings/integrations", ["business:update"])).toBe(false);
  });

  it("separates policy overview and policy audit access", () => {
    expect(route("/business/business-1/policies", ["policies:view"])).toBe(true);
    expect(route("/business/business-1/policies", ["policies:view_audit"])).toBe(false);
    expect(route("/business/business-1/policies/audit", ["policies:view_audit"])).toBe(true);
  });

  it("supports dynamic employee routes and denies unknown routes", () => {
    expect(route("/business/business-1/employees/employee-1", ["employees:view"])).toBe(true);
    expect(route("/business/business-1/unknown-sensitive-route", [])).toBe(false);
  });
});

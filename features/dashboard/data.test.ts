import { describe, expect, it } from "vitest";

import {
  canAccessBusinessNavigationItem,
  getEffectivePermissions,
  getBusinessNavigation,
  getBusinessNavigationItemForPath,
  isNavigationItemActive,
} from "./data";
import type { Permission } from "@/types/generic";

describe("dashboard navigation matching", () => {
  const role = (
    permissions: Permission[],
    deniedPermissions: Permission[] = [],
  ) => ({
    id: "role-1",
    name: "Custom",
    key: "custom",
    type: "custom" as const,
    permissions,
    deniedPermissions,
  });

  it("only activates business overview on its exact route", () => {
    const navigation = getBusinessNavigation(
      "business-1",
      new Set(["business:update"]),
    );
    const overview = navigation[0];
    const settings = navigation.find((item) => item.name === "Settings")!;

    expect(isNavigationItemActive("/business/business-1", overview)).toBe(true);
    expect(
      isNavigationItemActive("/business/business-1/settings", overview),
    ).toBe(false);
    expect(
      isNavigationItemActive("/business/business-1/settings", settings),
    ).toBe(true);
  });

  it("lets explicit denials override granted permissions", () => {
    const permissions = getEffectivePermissions(
      role(["invoices:view", "providers:view"], ["invoices:view"]),
    );
    expect(permissions.has("invoices:view")).toBe(false);
    expect(permissions.has("providers:view")).toBe(true);
  });

  it("requires exact permissions and hides missing items", () => {
    const navigation = getBusinessNavigation(
      "business-1",
      new Set(["invoices:view"]),
    );
    expect(navigation.map((item) => item.name)).toEqual([
      "Overview",
      "Invoices",
    ]);
  });

  it.each(["payments:view", "payments:view_own"] as const)(
    "shows Payments for %s",
    (permission) => {
      const navigation = getBusinessNavigation(
        "business-1",
        new Set([permission]),
      );
      expect(navigation.some((item) => item.name === "Payments")).toBe(true);
    },
  );

  it("shows Overview to active members with no section permissions", () => {
    expect(
      getBusinessNavigation("business-1", new Set()).map((item) => item.name),
    ).toEqual(["Overview"]);
  });

  it("shows Members only with members:view", () => {
    expect(
      getBusinessNavigation("business-1", new Set(["members:view"])).some(
        (item) => item.name === "Members",
      ),
    ).toBe(true);
    expect(
      getBusinessNavigation("business-1", new Set()).some(
        (item) => item.name === "Members",
      ),
    ).toBe(false);
  });

  it("shows policy navigation only with policies:view", () => {
    expect(
      getBusinessNavigation("business-1", new Set(["policies:view"])).some(
        (item) => item.name === "Policies",
      ),
    ).toBe(true);
    expect(
      getBusinessNavigation("business-1", new Set()).some(
        (item) => item.name === "Policies",
      ),
    ).toBe(false);
  });

  it("denies direct member detail routes without members:view", () => {
    const item = getBusinessNavigationItemForPath(
      "business-1",
      "/business/business-1/members/membership-1",
    )!;
    expect(item.name).toBe("Members");
    expect(canAccessBusinessNavigationItem(item, new Set())).toBe(false);
  });

  it("uses the same item requirement for direct-route access", () => {
    const settings = getBusinessNavigation(
      "business-1",
      new Set(["business:update"]),
    ).find((item) => item.name === "Settings")!;
    expect(canAccessBusinessNavigationItem(settings, new Set())).toBe(false);
  });
});

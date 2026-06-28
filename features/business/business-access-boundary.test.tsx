import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  BusinessLayoutSkeleton,
  BusinessForbiddenState,
  resolveBusinessAccessLayoutState,
} from "./business-access-boundary";

describe("business access layout states", () => {
  it("renders a workspace skeleton during initial loading", () => {
    expect(renderToStaticMarkup(<BusinessLayoutSkeleton />)).toContain(
      "Loading business workspace",
    );
  });

  it("keeps cached active context ready during a background refetch", () => {
    expect(
      resolveBusinessAccessLayoutState({
        hasData: true,
        isLoading: false,
        membershipStatus: "active",
      }),
    ).toBe("ready");
  });

  it.each([
    [null, "missing_membership"],
    ["suspended", "suspended"],
    ["removed", "removed"],
  ] as const)("handles %s membership", (membershipStatus, expected) => {
    expect(
      resolveBusinessAccessLayoutState({
        hasData: true,
        isLoading: false,
        membershipStatus,
      }),
    ).toBe(expected);
  });

  it("stops using cached access after an API 403", () => {
    expect(
      resolveBusinessAccessLayoutState({
        hasData: true,
        isLoading: false,
        errorStatus: 403,
        membershipStatus: "active",
      }),
    ).toBe("server_forbidden");
  });

  it("renders 403 content inside the business area for a protected URL", () => {
    const html = renderToStaticMarkup(
      <BusinessForbiddenState businessId="business-1" />,
    );
    expect(html).toContain("Permission required");
    expect(html).toContain("/business/business-1");
  });
});

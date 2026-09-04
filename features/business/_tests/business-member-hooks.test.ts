import { describe, expect, it } from "vitest";

import { businessMemberKeys } from "../business-member-hooks";

describe("business member query keys", () => {
  it("separates paginated list cache entries", () => {
    expect(businessMemberKeys.list("business-1", 1, 20)).not.toEqual(
      businessMemberKeys.list("business-1", 2, 20),
    );
  });

  it("scopes member detail by business and membership ID", () => {
    expect(businessMemberKeys.detail("business-1", "membership-1")).toEqual([
      "businesses",
      "business-1",
      "members",
      "membership-1",
    ]);
  });
});

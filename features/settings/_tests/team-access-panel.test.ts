import { describe, expect, it } from "vitest";

import { canInviteBusinessMembers } from "../components/team-access-panel";

describe("Team Access invite permission", () => {
  it("shows the invite action with members:invite", () => {
    expect(canInviteBusinessMembers(new Set(["members:invite"]))).toBe(true);
  });

  it("hides the invite action without members:invite", () => {
    expect(canInviteBusinessMembers(new Set())).toBe(false);
  });
});

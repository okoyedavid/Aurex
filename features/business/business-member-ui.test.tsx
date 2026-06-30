import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MembersState } from "./members-state";

describe("members request states", () => {
  it.each([
    ["Loading members", "Loading members"],
    ["No business members", "No business members"],
    ["Permission required", "Permission required"],
    ["Member not found", "Member not found"],
    ["Unable to load members", "Unable to load members"],
  ])("renders the %s state", (title, expected) => {
    expect(
      renderToStaticMarkup(<MembersState title={title} detail="Details" />),
    ).toContain(expected);
  });
});

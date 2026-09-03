import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WarpNarrative } from "./warp-narrative";

describe("Warp case-study narrative", () => {
  it("distinguishes capability roles from attribute policy resolution", () => {
    const html = renderToStaticMarkup(<WarpNarrative />);
    expect(html).toContain("RBAC grants capability");
    expect(html).toContain("ABAC resolves entitlement");
    expect(html).toContain("Why did Priya not receive the benefit?");
  });

  it("does not misrepresent capped cardinality as shipped behavior", () => {
    const html = renderToStaticMarkup(<WarpNarrative />);
    expect(html).toContain("Design-space example");
    expect(html).toContain("current API intentionally ships ONE/MANY");
    expect(html).toContain("deterministic tie-breaks");
  });
});

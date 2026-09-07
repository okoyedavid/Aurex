import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WarpNarrative } from "../warp-narrative";

describe("Warp case-study narrative", () => {
  it("distinguishes capability roles from attribute policy resolution", () => {
    const html = renderToStaticMarkup(<WarpNarrative />);
    expect(html).toContain("RBAC grants capability");
    expect(html).toContain("ABAC resolves entitlement");
    expect(html).toContain("How resolution stays deterministic");
    expect(html).toContain("Rules are stored as business data");
  });

  it("keeps the shipped cardinality model concise", () => {
    const html = renderToStaticMarkup(<WarpNarrative />);
    expect(html).toContain("Several policies may match, but only one effective policy survives resolution.");
    expect(html).toContain("Multiple eligible policies may remain effective together.");
    expect(html).not.toContain("capped set");
    expect(html).not.toContain("Policies cannot be activated until they contain a rule.");
  });
});

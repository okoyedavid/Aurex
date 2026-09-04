import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BusinessPageHeader } from "../business-page-header";

describe("BusinessPageHeader", () => {
  it("renders the employee-style heading and tab state", () => {
    const markup = renderToStaticMarkup(
      <BusinessPageHeader
        eyebrow="Aurex"
        title="Invitations"
        description="Manage invitation workflows."
        tabs={[
          { label: "Sent invites", active: true },
          { label: "Pending approvals", active: false },
        ]}
      />,
    );

    expect(markup).toContain("Invitations");
    expect(markup).toContain("Sent invites");
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain("border-b-2");
  });
});

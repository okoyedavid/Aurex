import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FeedbackState } from "../feedback-state";
import { Loading } from "../loading";
import { Skeleton } from "../skeleton";

describe("shared asynchronous states", () => {
  it("supports compact spinner and panel loading variants", () => {
    const spinner = renderToStaticMarkup(
      <Loading label="Loading employees…" variant="spinner" centered />,
    );
    const panels = renderToStaticMarkup(<Loading label="Loading policies…" />);

    expect(spinner).toContain('role="status"');
    expect(spinner).toContain("Loading employees…");
    expect(spinner).toContain("min-h-56");
    expect(panels.match(/animate-pulse/g)).toHaveLength(2);
  });

  it("renders reusable feedback variants and actions", () => {
    const markup = renderToStaticMarkup(
      <FeedbackState
        title="Unable to load employees"
        message="Please try again."
        retry={() => undefined}
        retryLabel="Retry"
        variant="inline"
      />,
    );

    expect(markup).toContain("Unable to load employees");
    expect(markup).toContain("Please try again.");
    expect(markup).toContain("Retry");
    expect(markup).toContain("border-destructive/30");
  });

  it("provides a single skeleton primitive", () => {
    const markup = renderToStaticMarkup(<Skeleton className="h-20" />);

    expect(markup).toContain("animate-pulse");
    expect(markup).toContain("h-20");
    expect(markup).toContain('aria-hidden="true"');
  });
});

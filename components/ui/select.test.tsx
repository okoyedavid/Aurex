import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DateInput } from "./date-input";
import { normalizeSingleSelectValue, SelectControl } from "./select";

describe("Aurex form controls", () => {
  it("renders single-value choices through the themed Radix trigger", () => {
    const markup = renderToStaticMarkup(
      <SelectControl value="" onChange={() => undefined} aria-label="Role type">
        <option value="">All role types</option>
        <option value="system">System roles</option>
        <option value="custom">Custom roles</option>
      </SelectControl>,
    );

    expect(markup).toContain('role="combobox"');
    expect(markup).toContain("border-input");
    expect(markup).toContain("inline-flex");
    const triggerClasses = markup.match(/<button[^>]*class="([^"]+)"/)?.[1].split(" ") ?? [];
    expect(triggerClasses).not.toContain("w-full");
    expect(markup).toContain("focus-visible:ring-ring/50");
    expect(markup).toContain('aria-label="Role type"');
  });

  it("normalizes numeric values used by pagination controls", () => {
    expect(normalizeSingleSelectValue(20)).toBe("20");
    expect(normalizeSingleSelectValue("pending")).toBe("pending");
    expect(normalizeSingleSelectValue(undefined)).toBeUndefined();
  });

  it("preserves native multi-select semantics", () => {
    const markup = renderToStaticMarkup(
      <SelectControl multiple value={["one"]} onChange={() => undefined}>
        <option value="one">One</option>
        <option value="two">Two</option>
      </SelectControl>,
    );

    expect(markup).toContain("<select");
    expect(markup).toContain('multiple=""');
  });

  it("renders themed native date and datetime controls", () => {
    const date = renderToStaticMarkup(<DateInput kind="date" value="2026-09-01" readOnly />);
    const dateTime = renderToStaticMarkup(<DateInput kind="datetime-local" value="2026-09-01T10:30" readOnly />);
    expect(date).toContain('type="date"');
    expect(date).toContain("text-primary");
    expect(dateTime).toContain('type="datetime-local"');
  });
});

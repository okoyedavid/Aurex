import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { GitHubTarget } from "@/lib/github-integration-api";
import { GitHubTargetSummary } from "@/features/policies/components/github-target-summary";

import { githubCallbackMessage } from "../github-callback-result";
import { isValidGitHubUsername } from "../components/employee-github-identity";
import { externalAccessStateCopy } from "../components/employee-external-access";

describe("GitHub integration presentation", () => {
  it.each([
    "demo-user",
    "a",
    "user123",
    "a-39-character-limit-is-still-valid-1",
  ])("accepts valid GitHub username %s", (username) => {
    expect(isValidGitHubUsername(username)).toBe(true);
  });

  it.each(["-leading", "trailing-", "two--hyphens", "has space", ""])(
    "rejects invalid GitHub username %s",
    (username) => {
      expect(isValidGitHubUsername(username)).toBe(false);
    },
  );

  it("presents repository and team targets without exposing IDs", () => {
    const targets: GitHubTarget[] = [
      {
        provider: "github",
        resourceType: "team",
        organizationId: 123,
        organizationLogin: "acme",
        teamId: 456,
        teamSlug: "backend",
        role: "member",
      },
      {
        provider: "github",
        resourceType: "repository",
        repositoryId: 789,
        owner: "acme",
        repo: "api",
        permission: "push",
      },
    ];
    const markup = targets
      .map((target) =>
        renderToStaticMarkup(<GitHubTargetSummary target={target} />),
      )
      .join("");

    expect(markup).toContain("GitHub team · acme/backend");
    expect(markup).toContain("Role: Member");
    expect(markup).toContain("GitHub repository · acme/api");
    expect(markup).toContain("Permission: Push");
    expect(markup).not.toContain("456");
    expect(markup).not.toContain("789");
    expect(markup).toContain("/github-mark.svg");
  });

  it("does not describe pending invitations or retained access as granted", () => {
    expect(externalAccessStateCopy.pending_acceptance.label).toBe(
      "Invitation pending",
    );
    expect(externalAccessStateCopy.pending_acceptance.detail).toContain(
      "must accept",
    );
    expect(externalAccessStateCopy.pending_acceptance.detail).not.toContain(
      "confirmed",
    );
    expect(externalAccessStateCopy.retained_external.label).toBe(
      "Access remains through another source",
    );
    expect(externalAccessStateCopy.retained_external.tone).toBe("warning");
    expect(externalAccessStateCopy.failed.detail).toContain(
      "retries automatically",
    );
  });

  it("maps backend callback result codes without exposing internal payloads", () => {
    expect(githubCallbackMessage("expired_state")).toContain("expired");
    expect(githubCallbackMessage("already_connected")).toContain(
      "another Aurex business",
    );
    expect(githubCallbackMessage("installation_not_authorized")).toContain(
      "not authorized",
    );
    expect(githubCallbackMessage("unexpected-internal-code")).toBe(
      "GitHub authorization could not be completed. Please try again.",
    );
  });
});

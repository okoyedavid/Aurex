import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import {
  createGitHubInstallUrl,
  getEmployeeExternalAccess,
  getEmployeeGitHubIdentity,
  getGitHubConnection,
  getGitHubRepositories,
  getGitHubTeams,
  isGitHubTarget,
  setEmployeeGitHubIdentity,
} from "../github-integration-api";

describe("GitHub integration API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses Aurex business-scoped endpoints and preserves the install URL", async () => {
    const url =
      "https://github.com/apps/aurex/installations/new?state=opaque-backend-state";
    const get = vi.spyOn(api, "get").mockResolvedValue({
      data: { data: { provider: "github", status: "disconnected" } },
    });
    const post = vi.spyOn(api, "post").mockResolvedValue({
      data: { data: { url, expiresAt: "2026-09-05T12:10:00.000Z" } },
    });

    await expect(getGitHubConnection("business-1")).resolves.toMatchObject({
      status: "disconnected",
    });
    await expect(createGitHubInstallUrl("business-1")).resolves.toMatchObject({
      url,
    });
    expect(get).toHaveBeenCalledWith(
      "/businesses/business-1/integrations/github",
    );
    expect(post).toHaveBeenCalledWith(
      "/businesses/business-1/integrations/github/install-url",
      {},
    );
  });

  it("requests discovered resources only through the Aurex API", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({
      data: { data: { items: [] } },
    });

    await getGitHubTeams("business-1");
    await getGitHubRepositories("business-1");

    expect(get.mock.calls.map(([path]) => path)).toEqual([
      "/businesses/business-1/integrations/github/teams",
      "/businesses/business-1/integrations/github/repositories",
    ]);
  });

  it("scopes identity and access requests by business and employee", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({
      data: { data: null },
    });
    const put = vi.spyOn(api, "put").mockResolvedValue({
      data: {
        data: {
          provider: "github",
          employeeId: "employee-1",
          username: "demo-user",
        },
      },
    });

    await getEmployeeGitHubIdentity("business-1", "employee-1");
    await getEmployeeExternalAccess("business-1", "employee-1");
    await setEmployeeGitHubIdentity(
      "business-1",
      "employee-1",
      "demo-user",
    );

    expect(get.mock.calls.map(([path]) => path)).toEqual([
      "/businesses/business-1/employees/employee-1/external-identities/github",
      "/businesses/business-1/employees/employee-1/external-access",
    ]);
    expect(put).toHaveBeenCalledWith(
      "/businesses/business-1/employees/employee-1/external-identities/github",
      { username: "demo-user" },
    );
  });
});

describe("GitHub policy target validation", () => {
  it("accepts complete team and repository targets", () => {
    expect(
      isGitHubTarget({
        provider: "github",
        resourceType: "team",
        organizationId: 10,
        organizationLogin: "acme",
        teamId: 20,
        teamSlug: "backend",
        role: "member",
      }),
    ).toBe(true);
    expect(
      isGitHubTarget({
        provider: "github",
        resourceType: "repository",
        repositoryId: 30,
        owner: "acme",
        repo: "api",
        permission: "push",
      }),
    ).toBe(true);
  });

  it("rejects incomplete targets and unsupported access levels", () => {
    expect(
      isGitHubTarget({
        provider: "github",
        resourceType: "team",
        teamId: 20,
        role: "maintainer",
      }),
    ).toBe(false);
    expect(
      isGitHubTarget({
        provider: "github",
        resourceType: "repository",
        repositoryId: 30,
        owner: "acme",
        repo: "api",
        permission: "owner",
      }),
    ).toBe(false);
  });
});

"use client";

import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/components/ui/select";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { businessErrorMessage } from "@/lib/business-api";
import type {
  GitHubRepositoryPermission,
  GitHubTarget,
} from "@/lib/github-integration-api";

import {
  useGitHubConnectionQuery,
  useGitHubRepositoriesQuery,
  useGitHubTeamsQuery,
} from "../github-hooks";

const permissions: GitHubRepositoryPermission[] = [
  "pull",
  "triage",
  "push",
  "maintain",
  "admin",
];

export function GitHubPolicyTargetFields({
  businessId,
  value,
  enabled,
  onEnabledChange,
  onChange,
  disabled,
}: {
  businessId: string;
  value: GitHubTarget | null;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onChange: (target: GitHubTarget | null) => void;
  disabled?: boolean;
}) {
  const { effectivePermissions } = useBusinessAccess();
  const canDiscover = effectivePermissions.has("integrations:view");
  const connection = useGitHubConnectionQuery(businessId, canDiscover);
  const active = connection.data?.status === "active";
  const [resourceType, setResourceType] = useState<"team" | "repository">(
    value?.resourceType ?? "team",
  );
  const [search, setSearch] = useState("");
  const teams = useGitHubTeamsQuery(
    businessId,
    enabled &&
      active &&
      canDiscover &&
      resourceType === "team" &&
      connection.data?.status === "active" &&
      connection.data.accountType === "Organization",
  );
  const repositories = useGitHubRepositoriesQuery(
    businessId,
    enabled && active && canDiscover && resourceType === "repository",
  );
  const filteredTeams = useMemo(
    () =>
      (teams.data?.items ?? []).filter((team) =>
        `${team.name} ${team.slug}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search, teams.data],
  );
  const filteredRepositories = useMemo(
    () =>
      (repositories.data?.items ?? []).filter((repo) =>
        repo.fullName.toLowerCase().includes(search.toLowerCase()),
      ),
    [repositories.data, search],
  );

  return (
    <fieldset
      className="space-y-4 rounded-md border border-border p-4"
      disabled={disabled}
    >
      <legend className="px-1 text-sm font-semibold">
        External enforcement
      </legend>
      <label className="block space-y-2 text-sm font-medium">
        Provider
        <SelectControl
          value={enabled ? "github" : "informational"}
          onChange={(event) => {
            const next = event.target.value === "github";
            onEnabledChange(next);
            if (!next) onChange(null);
          }}
        >
          <option value="informational">Informational only</option>
          <option value="github">GitHub</option>
        </SelectControl>
      </label>
      {enabled ? (
        !canDiscover ? (
          <FeedbackState
            tone="neutral"
            variant="inline"
            title="Integration access required"
            message="You need integrations:view to select GitHub resources."
          />
        ) : connection.isLoading ? (
          <p className="text-sm text-muted-foreground">
            Checking GitHub connection…
          </p>
        ) : connection.error ? (
          <FeedbackState
            variant="inline"
            title="Unable to load GitHub"
            message={businessErrorMessage(connection.error)}
            retry={() => void connection.refetch()}
          />
        ) : !connection.data || connection.data.status !== "active" ? (
          <FeedbackState
            tone="neutral"
            variant="inline"
            title={
              connection.data?.status === "suspended"
                ? "GitHub installation suspended"
                : "Connect GitHub first"
            }
            message="An active GitHub connection is required before choosing an enforcement resource."
          />
        ) : (
          <>
            <label className="block space-y-2 text-sm font-medium">
              Resource type
              <SelectControl
                value={resourceType}
                onChange={(event) => {
                  const next = event.target.value as "team" | "repository";
                  setResourceType(next);
                  setSearch("");
                  onChange(null);
                }}
              >
                <option
                  value="team"
                  disabled={connection.data.accountType !== "Organization"}
                >
                  Organization team (recommended)
                </option>
                <option value="repository">Repository collaborator</option>
              </SelectControl>
            </label>
            {resourceType === "team" &&
            connection.data.accountType !== "Organization" ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Teams require a GitHub organization installation.
              </p>
            ) : null}
            <label className="relative block">
              <span className="sr-only">Search GitHub resources</span>
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  resourceType === "team"
                    ? "Search teams"
                    : "Search repositories"
                }
              />
            </label>
            {resourceType === "team" &&
            connection.data.accountType === "Organization" ? (
              <ResourceSelect
                loading={teams.isLoading}
                error={teams.error}
                empty={
                  teams.data?.items.length && !filteredTeams.length
                    ? "No teams match your search."
                    : "No teams are available to this installation."
                }
                hasItems={filteredTeams.length > 0}
                retry={() => void teams.refetch()}
              >
                <SelectControl
                  aria-label="GitHub team"
                  value={
                    value?.resourceType === "team" ? String(value.teamId) : ""
                  }
                  onChange={(event) => {
                    const team = teams.data?.items.find(
                      (item) => item.id === Number(event.target.value),
                    );
                    onChange(
                      team
                        ? {
                            provider: "github",
                            resourceType: "team",
                            organizationId: team.organizationId,
                            organizationLogin: team.organizationLogin,
                            teamId: team.id,
                            teamSlug: team.slug,
                            role: "member",
                          }
                        : null,
                    );
                  }}
                >
                  <option value="">Select a team</option>
                  {filteredTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} · {team.organizationLogin}/{team.slug}
                    </option>
                  ))}
                </SelectControl>
              </ResourceSelect>
            ) : resourceType === "repository" ? (
              <ResourceSelect
                loading={repositories.isLoading}
                error={repositories.error}
                empty={
                  repositories.data?.items.length &&
                  !filteredRepositories.length
                    ? "No repositories match your search."
                    : connection.data.repositorySelection === "selected"
                      ? "No repositories are available. Check the GitHub App's selected repositories."
                      : "No repositories are available to this installation."
                }
                hasItems={filteredRepositories.length > 0}
                retry={() => void repositories.refetch()}
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
                  <SelectControl
                    aria-label="GitHub repository"
                    value={
                      value?.resourceType === "repository"
                        ? String(value.repositoryId)
                        : ""
                    }
                    onChange={(event) => {
                      const repository = repositories.data?.items.find(
                        (item) => item.id === Number(event.target.value),
                      );
                      onChange(
                        repository
                          ? {
                              provider: "github",
                              resourceType: "repository",
                              repositoryId: repository.id,
                              owner: repository.owner,
                              repo: repository.name,
                              permission:
                                value?.resourceType === "repository"
                                  ? value.permission
                                  : "pull",
                            }
                          : null,
                      );
                    }}
                  >
                    <option value="">Select a repository</option>
                    {filteredRepositories.map((repository) => (
                      <option key={repository.id} value={repository.id}>
                        {repository.fullName} ·{" "}
                        {repository.private ? "Private" : "Public"}
                      </option>
                    ))}
                  </SelectControl>
                  <SelectControl
                    aria-label="Repository permission"
                    value={
                      value?.resourceType === "repository"
                        ? value.permission
                        : "pull"
                    }
                    onChange={(event) => {
                      if (value?.resourceType === "repository") {
                        onChange({
                          ...value,
                          permission: event.target
                            .value as GitHubRepositoryPermission,
                        });
                      }
                    }}
                  >
                    {permissions.map((permission) => (
                      <option key={permission} value={permission}>
                        {permission.charAt(0).toUpperCase() + permission.slice(1)}
                      </option>
                    ))}
                  </SelectControl>
                </div>
              </ResourceSelect>
            ) : null}
            <p className="flex gap-2 text-xs leading-5 text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              Changing this target will cause Aurex to reconcile the old and
              new GitHub access after the policy update.
            </p>
          </>
        )
      ) : null}
    </fieldset>
  );
}

function ResourceSelect({
  loading,
  error,
  empty,
  hasItems,
  retry,
  children,
}: {
  loading: boolean;
  error: unknown;
  empty: string;
  hasItems: boolean;
  retry: () => void;
  children: React.ReactNode;
}) {
  if (loading)
    return (
      <p className="text-sm text-muted-foreground">Loading GitHub resources…</p>
    );
  if (error)
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <span>{businessErrorMessage(error)}</span>
        <Button type="button" size="sm" variant="outline" onClick={retry}>
          <RefreshCw /> Retry
        </Button>
      </div>
    );
  if (!hasItems)
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <div>{children}</div>;
}

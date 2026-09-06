import { api } from "@/lib/api";
import {
  toBusinessApiError,
  type BusinessResponse,
} from "@/lib/business-api";

export type GitHubConnectionStatus = "active" | "suspended" | "disconnected";

export type DisconnectedGitHubConnection = {
  provider: "github";
  status: "disconnected";
};

export type ConnectedGitHubConnection = {
  provider: "github";
  status: Exclude<GitHubConnectionStatus, "disconnected">;
  id: string;
  businessId: string;
  installationId: number | null;
  accountId: number | null;
  accountLogin: string | null;
  accountType: "Organization" | "User" | null;
  repositorySelection: "all" | "selected" | null;
  connectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GitHubConnection =
  | DisconnectedGitHubConnection
  | ConnectedGitHubConnection;

export type GitHubInstallUrl = { url: string; expiresAt: string };
export type GitHubRepository = {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
};
export type GitHubTeam = {
  id: number;
  slug: string;
  name: string;
  organizationId: number;
  organizationLogin: string;
};
export type GitHubTeamTarget = {
  provider: "github";
  resourceType: "team";
  organizationId: number;
  organizationLogin: string;
  teamId: number;
  teamSlug: string;
  role: "member";
};
export type GitHubRepositoryPermission =
  | "pull"
  | "triage"
  | "push"
  | "maintain"
  | "admin";
export type GitHubRepositoryTarget = {
  provider: "github";
  resourceType: "repository";
  repositoryId: number;
  owner: string;
  repo: string;
  permission: GitHubRepositoryPermission;
};
export type GitHubTarget = GitHubTeamTarget | GitHubRepositoryTarget;

export type EmployeeGitHubIdentity = {
  id: string;
  businessId: string;
  employeeId: string;
  provider: "github";
  externalId: number | null;
  username: string;
  verificationStatus: "unverified" | "verified";
  createdAt: string;
  updatedAt: string;
};

export type ExternalAccessActualState =
  | "unknown"
  | "pending"
  | "granted"
  | "revoked"
  | "drifted"
  | "blocked"
  | "needs_configuration"
  | "failed"
  | "pending_acceptance"
  | "retained_external";

export type ExternalAccessGrant = {
  id: string;
  businessId: string;
  employeeId: string;
  assignmentId: string;
  policyId: string;
  policyVersion: number;
  assignmentSource: "rule" | "manual";
  provider: "github";
  resourceType: "team" | "repository";
  resourceExternalId: string;
  resourceDisplayName: string;
  target: GitHubTarget;
  desiredState: "granted" | "revoked";
  desiredRevision: number;
  actualState: ExternalAccessActualState;
  managedByAurex: true;
  managedGrantCreated: boolean;
  baselinePermission: string | null;
  lastAttemptAt: string | null;
  lastVerifiedAt: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

const github = (businessId: string) =>
  `/businesses/${businessId}/integrations/github`;
const identity = (businessId: string, employeeId: string) =>
  `/businesses/${businessId}/employees/${employeeId}/external-identities/github`;

async function request<T>(work: () => Promise<{ data: BusinessResponse<T> }>) {
  try {
    return (await work()).data.data;
  } catch (error) {
    throw toBusinessApiError(error);
  }
}

export const getGitHubConnection = (businessId: string) =>
  request<GitHubConnection>(() => api.get(github(businessId)));
export const createGitHubInstallUrl = (businessId: string) =>
  request<GitHubInstallUrl>(() => api.post(`${github(businessId)}/install-url`, {}));
export const disconnectGitHub = (businessId: string) =>
  request<GitHubConnection>(() => api.delete(github(businessId)));
export const getGitHubRepositories = (businessId: string) =>
  request<{ items: GitHubRepository[] }>(() =>
    api.get(`${github(businessId)}/repositories`),
  );
export const getGitHubTeams = (businessId: string) =>
  request<{ items: GitHubTeam[] }>(() => api.get(`${github(businessId)}/teams`));
export const getEmployeeGitHubIdentity = (businessId: string, employeeId: string) =>
  request<EmployeeGitHubIdentity | null>(() => api.get(identity(businessId, employeeId)));
export const setEmployeeGitHubIdentity = (
  businessId: string,
  employeeId: string,
  username: string,
) => request<EmployeeGitHubIdentity>(() => api.put(identity(businessId, employeeId), { username }));
export const removeEmployeeGitHubIdentity = (businessId: string, employeeId: string) =>
  request<EmployeeGitHubIdentity>(() => api.delete(identity(businessId, employeeId)));
export const getEmployeeExternalAccess = (businessId: string, employeeId: string) =>
  request<{ items: ExternalAccessGrant[] }>(() =>
    api.get(`/businesses/${businessId}/employees/${employeeId}/external-access`),
  );

export function isGitHubTarget(value: unknown): value is GitHubTarget {
  if (!value || typeof value !== "object") return false;
  const target = value as Record<string, unknown>;
  if (target.provider !== "github") return false;
  if (target.resourceType === "team") {
    return (
      typeof target.organizationId === "number" &&
      typeof target.organizationLogin === "string" &&
      typeof target.teamId === "number" &&
      typeof target.teamSlug === "string" &&
      target.role === "member"
    );
  }
  return (
    target.resourceType === "repository" &&
    typeof target.repositoryId === "number" &&
    typeof target.owner === "string" &&
    typeof target.repo === "string" &&
    ["pull", "triage", "push", "maintain", "admin"].includes(
      String(target.permission),
    )
  );
}

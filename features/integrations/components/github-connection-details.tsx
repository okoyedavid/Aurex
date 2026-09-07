import { PolicyBadge } from "@/features/policies/components/policy-ui";
import type { GitHubConnection } from "@/lib/github-integration-api";

export function GitHubConnectionBadge({ status }: { status: "active" | "suspended" | "disconnected" }) {
  return <PolicyBadge tone={status === "active" ? "success" : status === "suspended" ? "warning" : "neutral"}>{status === "active" ? "Connected" : status === "suspended" ? "Suspended" : "Disconnected"}</PolicyBadge>;
}

export function GitHubConnectionDetails({ connection }: { connection?: GitHubConnection }) {
  if (!connection || connection.status === "disconnected") return <p className="mt-3 text-sm text-muted-foreground">Policies remain informational until GitHub is connected and a target is configured.</p>;
  if (connection.status === "suspended") return <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">The GitHub installation is suspended. Restore it in GitHub before configuring resources.</p>;
  return <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-xs text-muted-foreground">Account</dt><dd className="mt-1 break-words font-medium">{connection.accountLogin ?? "Unknown"} · {connection.accountType ?? "GitHub"}</dd></div><div><dt className="text-xs text-muted-foreground">Repositories</dt><dd className="mt-1 font-medium">{connection.repositorySelection === "all" ? "All repositories" : "Selected repositories"}</dd></div><div><dt className="text-xs text-muted-foreground">Connected</dt><dd className="mt-1 font-medium">{formatDate(connection.connectedAt)}</dd></div></dl>;
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

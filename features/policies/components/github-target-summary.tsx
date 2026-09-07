import { GitHubIcon } from "@/components/icons/github-icon";
import type { GitHubTarget } from "@/lib/github-integration-api";

export function GitHubTargetSummary({ target }: { target: GitHubTarget }) {
  const isTeam = target.resourceType === "team";
  const resource = isTeam
    ? `${target.organizationLogin}/${target.teamSlug}`
    : `${target.owner}/${target.repo}`;
  const access = isTeam
    ? "Member"
    : target.permission.charAt(0).toUpperCase() + target.permission.slice(1);

  return (
    <div className="mt-1 min-w-0">
      <p className="flex items-center gap-2 font-medium">
        <GitHubIcon />
        <span className="break-words">
          GitHub {isTeam ? "team" : "repository"} · {resource}
        </span>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {isTeam ? "Role" : "Permission"}: {access}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Policy assignment creates the desired access. Employee access status
        shows whether GitHub has verified it.
      </p>
    </div>
  );
}

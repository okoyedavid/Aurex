"use client";

import { Loader2, Plug, Unplug } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github-icon";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessAccess } from "@/features/business/business-access-context";
import {
  ConfirmPolicyAction,
  PolicyBadge,
} from "@/features/policies/components/policy-ui";
import { SettingsSection } from "@/features/settings/settings-section";
import { businessErrorMessage } from "@/lib/business-api";
import { githubCallbackMessage } from "./github-callback-result";

import {
  useCreateGitHubInstallUrlMutation,
  useDisconnectGitHubMutation,
  useGitHubConnectionQuery,
} from "./github-hooks";

export function GitHubConnectionPanel({
  callbackResult,
  callbackReason,
}: {
  callbackResult?: string;
  callbackReason?: string;
}) {
  const router = useRouter();
  const { business, effectivePermissions } = useBusinessAccess();
  const canView = effectivePermissions.has("integrations:view");
  const canManage = effectivePermissions.has("integrations:manage");
  const connection = useGitHubConnectionQuery(business.id, canView);
  const install = useCreateGitHubInstallUrlMutation(business.id);
  const disconnect = useDisconnectGitHubMutation(business.id);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const handledCallback = useRef(false);

  useEffect(() => {
    if (handledCallback.current) return;
    const result = callbackResult;
    if (result !== "connected" && result !== "error") return;
    handledCallback.current = true;

    if (result === "connected") {
      toast.success("GitHub connected.");
      void connection.refetch();
    } else {
      toast.error(githubCallbackMessage(callbackReason ?? null));
    }
    router.replace(`/business/${business.id}/settings#integrations`);
  }, [business.id, callbackReason, callbackResult, connection, router]);

  const connect = () => {
    install.mutate(undefined, {
      onSuccess: ({ url }) => {
        window.location.assign(url);
      },
      onError: (error) => toast.error(businessErrorMessage(error)),
    });
  };

  return (
    <SettingsSection
      id="integrations"
      title="Integrations"
      description="Connect services that Aurex can manage from your existing policies."
      icon={Plug}
    >
      {!canView ? (
        <FeedbackState
          tone="neutral"
          variant="empty"
          title="Integration access required"
          message="You need integrations:view to see business integrations."
        />
      ) : connection.isLoading ? (
        <div className="space-y-4" aria-label="Loading GitHub connection">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-32" />
        </div>
      ) : connection.error ? (
        <FeedbackState
          variant="inline"
          title="Unable to load GitHub"
          message={businessErrorMessage(connection.error)}
          retry={() => void connection.refetch()}
        />
      ) : (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <GitHubIcon className="size-5" />
              <h3 className="font-semibold">GitHub</h3>
              <ConnectionBadge
                status={connection.data?.status ?? "disconnected"}
              />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Automatically manage organization team and repository access from
              Aurex application-access policies.
            </p>
            <ConnectionDetails connection={connection.data} />
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              onClick={connect}
              disabled={!canManage || install.isPending}
              title={!canManage ? "Requires integrations:manage" : undefined}
            >
              {install.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <GitHubIcon />
              )}
              {connection.data?.status !== "disconnected"
                ? "Reconnect GitHub"
                : "Connect GitHub"}
            </Button>
            {connection.data?.status &&
            connection.data.status !== "disconnected" ? (
              <Button
                variant="destructive"
                onClick={() => setConfirmDisconnect(true)}
                disabled={!canManage}
                title={!canManage ? "Requires integrations:manage" : undefined}
              >
                <Unplug /> Disconnect
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <ConfirmPolicyAction
        open={confirmDisconnect}
        title="Disconnect GitHub?"
        description="Aurex will stop reconciling GitHub access. Existing desired assignments remain and may show Needs configuration. This does not uninstall the GitHub App; uninstall it separately in GitHub if needed."
        confirmLabel="Disconnect GitHub"
        tone="danger"
        pending={disconnect.isPending}
        onOpenChange={setConfirmDisconnect}
        onConfirm={() =>
          disconnect.mutate(undefined, {
            onSuccess: () => {
              setConfirmDisconnect(false);
              toast.success("GitHub disconnected from Aurex.");
            },
            onError: (error) => toast.error(businessErrorMessage(error)),
          })
        }
      />
    </SettingsSection>
  );
}

function ConnectionBadge({
  status,
}: {
  status: "active" | "suspended" | "disconnected";
}) {
  return (
    <PolicyBadge
      tone={
        status === "active"
          ? "success"
          : status === "suspended"
            ? "warning"
            : "neutral"
      }
    >
      {status === "active"
        ? "Connected"
        : status === "suspended"
          ? "Suspended"
          : "Disconnected"}
    </PolicyBadge>
  );
}

function ConnectionDetails({
  connection,
}: {
  connection?: import("@/lib/github-integration-api").GitHubConnection;
}) {
  if (!connection || connection.status === "disconnected") {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Policies remain informational until GitHub is connected and a target is
        configured.
      </p>
    );
  }
  if (connection.status === "suspended") {
    return (
      <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
        The GitHub installation is suspended. Restore it in GitHub before
        configuring resources.
      </p>
    );
  }
  return (
    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
      <div>
        <dt className="text-xs text-muted-foreground">Account</dt>
        <dd className="mt-1 font-medium break-words">
          {connection.accountLogin ?? "Unknown"} ·{" "}
          {connection.accountType ?? "GitHub"}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Repositories</dt>
        <dd className="mt-1 font-medium">
          {connection.repositorySelection === "all"
            ? "All repositories"
            : "Selected repositories"}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Connected</dt>
        <dd className="mt-1 font-medium">
          {formatDate(connection.connectedAt)}
        </dd>
      </div>
    </dl>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

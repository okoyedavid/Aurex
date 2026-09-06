"use client";

import { ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import {
  ConfirmPolicyAction,
  PolicyBadge,
} from "@/features/policies/components/policy-ui";
import { businessErrorMessage } from "@/lib/business-api";

import {
  useEmployeeExternalAccessQuery,
  useEmployeeGitHubIdentityQuery,
  useRemoveEmployeeGitHubIdentityMutation,
  useSetEmployeeGitHubIdentityMutation,
} from "./github-hooks";

const githubUsername = /^(?=.{1,39}$)[a-z\d]+(?:-[a-z\d]+)*$/i;

export function EmployeeGitHubIdentity({
  businessId,
  employeeId,
}: {
  businessId: string;
  employeeId: string;
}) {
  const { effectivePermissions } = useBusinessAccess();
  const canView = effectivePermissions.has("employees:view");
  const canUpdate = effectivePermissions.has("employees:update");
  const identity = useEmployeeGitHubIdentityQuery(
    businessId,
    employeeId,
    canView,
  );
  const access = useEmployeeExternalAccessQuery(
    businessId,
    employeeId,
    effectivePermissions.has("policies:view"),
  );
  const setIdentity = useSetEmployeeGitHubIdentityMutation(
    businessId,
    employeeId,
  );
  const removeIdentity = useRemoveEmployeeGitHubIdentityMutation(
    businessId,
    employeeId,
  );
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [username, setUsername] = useState("");
  const [validation, setValidation] = useState("");
  const canInspectAccess = effectivePermissions.has("policies:view");
  const managedAccessActive = Boolean(
    access.data?.items.some(
      (item) =>
        item.managedByAurex &&
        item.desiredState === "granted" &&
        item.actualState !== "revoked",
    ),
  );
  const removalBlocked =
    !canInspectAccess || access.isLoading || Boolean(access.error) || managedAccessActive;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = username.trim();
    if (!githubUsername.test(value)) {
      setValidation(
        "Enter a valid GitHub username of up to 39 characters without leading or trailing hyphens.",
      );
      return;
    }
    setValidation("");
    setIdentity.mutate(value, {
      onSuccess: () => {
        setEditing(false);
        toast.success("GitHub identity updated.");
      },
    });
  };

  if (identity.isLoading) return <Loading label="Loading GitHub identity…" />;
  if (identity.error)
    return (
      <FeedbackState
        variant="inline"
        title="Unable to load GitHub identity"
        message={businessErrorMessage(identity.error)}
        retry={() => void identity.refetch()}
      />
    );

  return (
    <div>
      {identity.data ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <GitHubIcon />
              <a
                className="break-all font-medium hover:text-primary"
                href={`https://github.com/${encodeURIComponent(identity.data.username)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{identity.data.username}{" "}
                <ExternalLink className="inline size-3" />
              </a>
              <PolicyBadge
                tone={
                  identity.data.verificationStatus === "verified"
                    ? "success"
                    : "warning"
                }
              >
                {identity.data.verificationStatus === "verified"
                  ? "Verified"
                  : "Unverified"}
              </PolicyBadge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Aurex uses this identity when enforcing GitHub access policies.
            </p>
          </div>
          {canUpdate ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setUsername(identity.data?.username ?? "");
                  setValidation("");
                  setEditing(true);
                }}
              >
                <Pencil /> Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmRemove(true)}
                disabled={removalBlocked}
                title={
                  removalBlocked
                    ? "Revoke Aurex-managed GitHub access before removing this identity."
                    : undefined
                }
              >
                <Trash2 /> Remove
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <FeedbackState
          tone="neutral"
          variant="empty"
          title="No GitHub identity configured."
          message="GitHub enforcement will show Needs configuration until a username is set."
          action={
            canUpdate ? (
              <Button
                onClick={() => {
                  setUsername("");
                  setValidation("");
                  setEditing(true);
                }}
              >
                <GitHubIcon /> Configure GitHub identity
              </Button>
            ) : undefined
          }
        />
      )}
      {identity.data && removalBlocked ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Revoke Aurex-managed GitHub access before removing this identity.
        </p>
      ) : null}

      <Dialog
        open={editing}
        onOpenChange={(open) => !setIdentity.isPending && setEditing(open)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>GitHub identity</DialogTitle>
            <DialogDescription>
              Aurex uses this identity when enforcing GitHub access policies.
              This does not give Aurex the employee&apos;s password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-2 text-sm font-medium">
              GitHub username
              <Input
                value={username}
                autoComplete="off"
                disabled={setIdentity.isPending}
                aria-invalid={Boolean(validation || setIdentity.error)}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            {validation || setIdentity.error ? (
              <p className="text-sm text-destructive">
                {validation || businessErrorMessage(setIdentity.error)}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={setIdentity.isPending}
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button disabled={setIdentity.isPending}>
                {setIdentity.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : null}
                Save identity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmPolicyAction
        open={confirmRemove}
        title="Remove GitHub identity?"
        description={
          access.data?.items.some((item) => item.desiredState === "granted")
            ? "This employee has desired GitHub access. Removing the identity will move enforcement to Needs configuration; it does not prove existing GitHub access was revoked."
            : "Aurex will no longer be able to identify this employee for GitHub enforcement."
        }
        confirmLabel="Remove identity"
        tone="danger"
        pending={removeIdentity.isPending}
        onOpenChange={setConfirmRemove}
        onConfirm={() =>
          removeIdentity.mutate(undefined, {
            onSuccess: () => {
              setConfirmRemove(false);
              toast.success("GitHub identity removal confirmed by Aurex.");
            },
            onError: (error) => toast.error(businessErrorMessage(error)),
          })
        }
      />
    </div>
  );
}

export function isValidGitHubUsername(value: string) {
  return githubUsername.test(value.trim());
}

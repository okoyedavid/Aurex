"use client";

import { SelectControl } from "@/components/ui/select";

import {
  Archive,
  ChevronDown,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { BusinessPageHeader } from "@/features/business/business-page-header";
import { MembersPageFrame } from "@/features/business/members-page-frame";
import { Pagination } from "@/features/business/pagination";
import type { BusinessRole } from "@/lib/access-api";

import { useAllBusinessRoles, useArchiveCustomRole } from "./hooks";
import { RoleDialog } from "./role-dialog";
import { Badge, ErrorState, PermissionList } from "./shared";

const rolesPerPage = 5;
type RoleTypeFilter = "all" | BusinessRole["type"];

export function BusinessRolesPage({ businessId }: { businessId: string }) {
  const { business, effectivePermissions } = useBusinessAccess();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const search = searchParams.get("search") ?? "";
  const [typeFilter, setTypeFilter] = useState<RoleTypeFilter>("all");
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [editing, setEditing] = useState<BusinessRole | null | undefined>(
    undefined,
  );
  const [archive, setArchive] = useState<BusinessRole | null>(null);
  const canView = effectivePermissions.has("roles:view");
  const canCreate = effectivePermissions.has("roles:create");
  const query = useAllBusinessRoles(businessId, canView);
  const archiveMutation = useArchiveCustomRole(businessId, archive?.id ?? "");
  const available = Array.from(effectivePermissions);

  useEffect(() => {
    setPage(1);
    setExpandedRoleId(null);
  }, [search]);

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setTypeFilter("all");
  };

  const filteredRoles = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return (query.data ?? []).filter(
      (role) =>
        (typeFilter === "all" || role.type === typeFilter) &&
        (!normalizedSearch ||
          role.name.toLocaleLowerCase().includes(normalizedSearch)),
    );
  }, [query.data, search, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / rolesPerPage));
  const effectivePage = Math.min(page, totalPages);
  const visibleRoles = filteredRoles.slice(
    (effectivePage - 1) * rolesPerPage,
    effectivePage * rolesPerPage,
  );

  if (!canView) {
    return (
      <MembersPageFrame>
        <ErrorState
          error={new Error("You do not have permission to view roles.")}
        />
      </MembersPageFrame>
    );
  }

  return (
    <MembersPageFrame>
      <BusinessPageHeader
        eyebrow={business.name}
        title="Roles & permissions"
        description="View and manage system and custom roles for your business."
        actions={
          canCreate ? (
            <Button
              onClick={() => setEditing(null)}
            >
              <Plus /> Create custom role
            </Button>
          ) : null
        }
      />

      <div className="mt-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Access profiles
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.data
              ? `${query.data.length} ${query.data.length === 1 ? "role" : "roles"} configured`
              : "Loading configured roles"}
          </p>
        </div>

        <div className="mt-4 flex justify-end rounded-md border border-border bg-card p-3 shadow-sm">
          <label className="sm:w-48">
            <span className="sr-only">Filter roles by type</span>
            <SelectControl
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as RoleTypeFilter);
                setPage(1);
                setExpandedRoleId(null);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="all">All role types</option>
              <option value="system">System roles</option>
              <option value="custom">Custom roles</option>
            </SelectControl>
          </label>
        </div>
      </div>

      <div className="mt-4">
        {query.isLoading ? (
          <div className="rounded-md border border-border bg-card px-6">
            <Loading label="Loading…" variant="spinner" className="py-12" />
          </div>
        ) : query.error ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : visibleRoles.length ? (
          <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
            {visibleRoles.map((role, index) => (
              <RoleRow
                key={role.id}
                role={role}
                open={expandedRoleId === role.id}
                separated={index > 0}
                canEdit={effectivePermissions.has("roles:update")}
                canArchive={effectivePermissions.has("roles:delete")}
                onToggle={() =>
                  setExpandedRoleId((current) =>
                    current === role.id ? null : role.id,
                  )
                }
                onEdit={() => setEditing(role)}
                onArchive={() => setArchive(role)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {query.data?.length ? (
                <Search className="size-6" />
              ) : (
                <ShieldCheck className="size-6" />
              )}
            </div>
            <h2 className="mt-4 font-semibold">
              {query.data?.length ? "No matching roles" : "No roles configured"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {query.data?.length
                ? "Try another role name or change the type filter."
                : "Create a role to give team members only the access they need."}
            </p>
            {query.data?.length ? (
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => {
                  clearFilters();
                }}
              >
                Clear filters
              </Button>
            ) : canCreate ? (
              <Button className="mt-5" onClick={() => setEditing(null)}>
                <Plus /> Create custom role
              </Button>
            ) : null}
          </div>
        )}

        {!query.isLoading && !query.error && filteredRoles.length ? (
          <Pagination
            page={effectivePage}
            totalPages={totalPages}
            total={filteredRoles.length}
            limit={rolesPerPage}
            fetching={query.isFetching}
            showLimit={false}
            onPage={(value) => {
              setPage(value);
              setExpandedRoleId(null);
            }}
            onLimit={() => undefined}
          />
        ) : null}
      </div>

      <RoleDialog
        businessId={businessId}
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined);
        }}
        role={editing}
        available={available}
      />

      <Dialog
        open={Boolean(archive)}
        onOpenChange={(open) => {
          if (!open) setArchive(null);
        }}
      >
        <DialogContent className="max-w-md">
          <div className="flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <Archive className="size-5" />
          </div>
          <DialogHeader>
            <DialogTitle>Archive {archive?.name}?</DialogTitle>
            <DialogDescription>
              This role will no longer be available for future assignments.
              Existing audit history will remain intact.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Existing members using this role may require a replacement role.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchive(null)}>
              Keep role
            </Button>
            <Button
              variant="destructive"
              disabled={archiveMutation.isPending}
              onClick={() =>
                archiveMutation.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("Role archived.");
                    setArchive(null);
                  },
                  onError: (error) => toast.error(error.message),
                })
              }
            >
              {archiveMutation.isPending ? "Archiving..." : "Archive role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MembersPageFrame>
  );
}

function RoleRow({
  role,
  open,
  separated,
  canEdit,
  canArchive,
  onToggle,
  onEdit,
  onArchive,
}: {
  role: BusinessRole;
  open: boolean;
  separated: boolean;
  canEdit: boolean;
  canArchive: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const isCustom = role.type === "custom";
  const isActive = role.status === "active";
  const denied = new Set(role.deniedPermissions);
  const effectiveCount = role.permissions.filter(
    (permission) => !denied.has(permission),
  ).length;
  const detailsId = `role-${role.id}-details`;

  return (
    <article className={`${separated ? "border-t border-border" : ""} ${isActive ? "" : "opacity-75"}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 sm:px-5"
      >
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${isCustom ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          {isCustom ? <Sparkles className="size-4" /> : <LockKeyhole className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold sm:text-base">{role.name}</span>
            <Badge tone={isCustom ? "good" : "neutral"}>{role.type}</Badge>
            {!isActive ? <Badge tone="bad">archived</Badge> : null}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{effectiveCount} effective permissions</span>
            {role.deniedPermissions.length ? (
              <span className="text-destructive">{role.deniedPermissions.length} denied</span>
            ) : null}
          </span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div id={detailsId} className="border-t border-border bg-muted/20 px-4 py-5 sm:px-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{role.key}</code>
            {isCustom && isActive && (canEdit || canArchive) ? (
              <div className="flex gap-2">
                {canEdit ? (
                  <Button size="sm" variant="outline" onClick={onEdit}><Pencil /> Edit role</Button>
                ) : null}
                {canArchive ? (
                  <Button size="sm" variant="destructive" onClick={onArchive}><Archive /> Archive</Button>
                ) : null}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">{isCustom ? "Archived" : "Managed by Aurex"}</span>
            )}
          </div>
          <PermissionList permissions={role.permissions} denied={role.deniedPermissions} />
        </div>
      ) : null}
    </article>
  );
}

"use client";
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/features/business/pagination";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "./hooks";
import { Badge, ErrorState, formatDateTime, LoadingState } from "./shared";

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [unread, setUnread] = useState(false);
  const query = useNotifications(page, limit, unread),
    mark = useMarkNotificationRead(),
    markAll = useMarkAllNotificationsRead();
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Personal dashboard</p>
            <h1 className="mt-1 text-3xl font-bold">Notifications</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Account activity and access updates addressed to you.
            </p>
          </div>
          {query.data?.unreadCount ? (
            <Button
              variant="outline"
              disabled={markAll.isPending}
              onClick={() =>
                markAll.mutate(undefined, {
                  onSuccess: () =>
                    toast.success("All notifications marked as read."),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              <CheckCheck />
              Mark all read
            </Button>
          ) : null}
        </div>
        <div className="mt-6 inline-flex rounded-md bg-muted p-1">
          <button
            className={`rounded-md px-4 py-1.5 text-sm ${!unread ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`}
            onClick={() => {
              setUnread(false);
              setPage(1);
            }}
          >
            All
          </button>
          <button
            className={`rounded-md px-4 py-1.5 text-sm ${unread ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`}
            onClick={() => {
              setUnread(true);
              setPage(1);
            }}
          >
            Unread
          </button>
        </div>
        <div className="mt-5 overflow-hidden rounded-md border border-border bg-card">
          {query.isLoading ? (
            <div className="p-5">
              <LoadingState />
            </div>
          ) : query.error ? (
            <div className="p-5">
              <ErrorState error={query.error} onRetry={() => query.refetch()} />
            </div>
          ) : query.data?.items.length ? (
            query.data.items.map((n) => (
              <article
                key={n.id}
                className={`border-b border-border p-5 last:border-0 ${n.readAt ? "" : "bg-primary/5"}`}
              >
                <div className="flex gap-4">
                  <span
                    className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${n.readAt ? "bg-border" : "bg-primary"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{n.title}</h2>
                        <Badge
                          tone={
                            n.severity === "critical" || n.severity === "error"
                              ? "bad"
                              : n.severity === "warning"
                                ? "warn"
                                : "neutral"
                          }
                        >
                          {n.severity}
                        </Badge>
                      </div>
                      <time className="text-xs text-muted-foreground">
                        {formatDateTime(n.createdAt)}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {n.message}
                    </p>
                    {!n.readAt ? (
                      <Button
                        className="mt-3"
                        size="sm"
                        variant="ghost"
                        disabled={mark.isPending}
                        onClick={() =>
                          mark.mutate(n.id, {
                            onError: (e) => toast.error(e.message),
                          })
                        }
                      >
                        Mark as read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="p-12 text-center text-sm text-muted-foreground">
              {unread ? "No unread notifications." : "No notifications yet."}
            </p>
          )}
        </div>
        {query.data ? (
          <Pagination
            page={page}
            totalPages={query.data.pagination.totalPages}
            total={query.data.pagination.total}
            limit={limit}
            fetching={query.isFetching}
            onPage={setPage}
            onLimit={(value) => {
              setLimit(value);
              setPage(1);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

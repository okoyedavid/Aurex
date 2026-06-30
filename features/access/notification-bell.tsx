"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useMarkNotificationRead, useNotifications } from "./hooks";
import { formatDateTime } from "./shared";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const query = useNotifications(1, 5, false);
  const mark = useMarkNotificationRead();
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Notifications${query.data?.unreadCount ? ` (${query.data.unreadCount} unread)` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {query.data?.unreadCount ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-5 text-primary-foreground">
            {query.data.unreadCount > 99 ? "99+" : query.data.unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Recent notifications"
          className="fixed left-3 right-3 top-[4.5rem] z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96"
        >
          <div className="border-b border-border px-4 py-3.5">
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <div className="max-h-[min(24rem,calc(100dvh-9rem))] overflow-y-auto overscroll-contain">
            {query.isLoading ? (
              <p className="p-5 text-sm text-muted-foreground">Loading…</p>
            ) : query.error ? (
              <p className="p-5 text-sm text-destructive">
                Notifications are unavailable.
              </p>
            ) : query.data?.items.length ? (
              query.data.items.map((n) => (
                <button
                  key={n.id}
                  className={`block w-full border-b border-border p-3.5 text-left hover:bg-muted sm:p-4 ${n.readAt ? "" : "bg-primary/5"}`}
                  onClick={() => {
                    if (!n.readAt) mark.mutate(n.id);
                  }}
                >
                  <div className="flex min-w-0 justify-between gap-2">
                    <p className="min-w-0 break-words text-sm font-semibold">
                      {n.title}
                    </p>
                    {!n.readAt ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-muted-foreground">
                    {n.message}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </p>
                </button>
              ))
            ) : (
              <p className="p-6 text-center text-sm text-muted-foreground">
                You’re all caught up.
              </p>
            )}
          </div>
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border p-3 text-center text-sm font-semibold text-primary hover:bg-muted"
          >
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}

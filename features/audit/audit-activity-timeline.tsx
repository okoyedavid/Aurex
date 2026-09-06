import type { AuditItem, AuditPrimitive } from "@/lib/audit-api";

import {
  formatAuditEvent,
  type AuditPresentationScope,
} from "./audit-event-copy";

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
});

type ActivityGroup = {
  key: string;
  label: string;
  items: AuditItem[];
};

export function AuditActivityTimeline({
  items,
  scope,
  emptyTitle = "No activity yet.",
  emptyDescription,
}: {
  items: AuditItem[];
  scope: AuditPresentationScope;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (!items.length) {
    return (
      <div className="border-l-2 border-border pl-4 text-sm">
        <p className="font-medium">{emptyTitle}</p>
        {emptyDescription ? (
          <p className="mt-1 text-muted-foreground">{emptyDescription}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupByDate(items).map((group) => (
        <ActivityGroupView key={group.key} group={group} scope={scope} />
      ))}
    </div>
  );
}

function ActivityGroupView({
  group,
  scope,
}: {
  group: ActivityGroup;
  scope: AuditPresentationScope;
}) {
  const headingId = `audit-activity-${group.key.replaceAll(/[^a-z0-9]/gi, "-")}`;

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="text-sm font-medium text-muted-foreground">
        {group.label}
      </h3>
      <ol className="mt-2">
        {group.items.map((item, index) => (
          <ActivityItem
            key={item.id}
            item={item}
            scope={scope}
            connectsToNext={index < group.items.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}

function ActivityItem({
  item,
  scope,
  connectsToNext,
}: {
  item: AuditItem;
  scope: AuditPresentationScope;
  connectsToNext: boolean;
}) {
  const presentation = formatAuditEvent(item, scope);

  return (
    <li className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3">
      <div className="relative flex justify-center" aria-hidden="true">
        <span className="absolute top-1.5 z-10 size-2.5 rounded-full border-2 border-primary bg-background" />
        {connectsToNext ? (
          <span className="absolute -bottom-1.5 top-4 w-px bg-border" />
        ) : null}
      </div>
      <article className="min-w-0 pb-5">
        <div className="sm:flex sm:items-start sm:justify-between sm:gap-4">
          <h4 className="min-w-0 break-words text-sm font-medium">
            {presentation.title}
          </h4>
          <time
            dateTime={item.occurredAt}
            className="mt-0.5 block shrink-0 text-xs text-muted-foreground sm:mt-1"
          >
            {formatTime(item.occurredAt)}
          </time>
        </div>
        {presentation.description ? (
          <p className="mt-1 max-w-3xl break-words text-sm leading-5 text-muted-foreground">
            {presentation.description}
          </p>
        ) : null}
        {presentation.changes.length ? (
          <ChangeDetails changes={presentation.changes} />
        ) : null}
        <p className="mt-2 break-words text-xs text-muted-foreground">
          {presentation.metadata.join(" · ")}
        </p>
      </article>
    </li>
  );
}

function ChangeDetails({
  changes,
}: {
  changes: NonNullable<AuditItem["changes"]>;
}) {
  return (
    <details className="group mt-3 max-w-2xl text-sm">
      <summary className="w-fit cursor-pointer list-none font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">View changes</span>
        <span className="hidden group-open:inline">Hide changes</span>
      </summary>
      <dl className="mt-2 space-y-2 border-l border-border pl-3">
        {changes.map((change, index) => (
          <div key={`${change.field}-${index}`}>
            <dt className="break-words text-xs font-medium">
              {humanizeField(change.field)}
            </dt>
            <dd className="mt-0.5 break-words text-sm text-muted-foreground">
              {formatValue(change.before)}
              <span aria-hidden="true"> → </span>
              <span className="sr-only"> changed to </span>
              {formatValue(change.after)}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function groupByDate(items: AuditItem[]): ActivityGroup[] {
  return items.reduce<ActivityGroup[]>((groups, item) => {
    const date = new Date(item.occurredAt);
    const valid = !Number.isNaN(date.getTime());
    const key = valid
      ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      : "unknown-date";
    const previous = groups.at(-1);

    if (previous?.key === key) {
      previous.items.push(item);
      return groups;
    }

    groups.push({
      key,
      label: valid ? dateFormatter.format(date) : "Date unavailable",
      items: [item],
    });
    return groups;
  }, []);
}

function humanizeField(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll(/[._-]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^\w/, (character) => character.toUpperCase());
}

function formatValue(value: AuditPrimitive) {
  if (value === null || value === "") return "Not set";
  if (value === "[changed]") return "Changed (details redacted)";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : timeFormatter.format(date);
}

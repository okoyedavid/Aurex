import { AuditItem, AuditPrimitive } from "@/lib/audit-api";
import { FeedbackState } from "@/components/ui/feedback-state";

export function PolicyAuditTable({ items }: { items: AuditItem[] }) {
  if (!items.length) {
    return (
      <FeedbackState
        title="No policy history matches these filters."
        tone="neutral"
        variant="empty"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="p-4">Timestamp</th>
            <th className="p-4">Action</th>
            <th className="p-4">Subject</th>
            <th className="p-4">Actor</th>
            <th className="p-4">Changes</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="whitespace-nowrap p-4 text-xs text-muted-foreground">
                {new Date(item.occurredAt).toLocaleString()}
              </td>

              <td className="p-4">
                <p className="font-medium">{humanizeAuditValue(item.action)}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {item.summary}
                </p>

                {item.reason ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.reason}
                  </p>
                ) : null}
              </td>

              <td className="p-4">
                {item.subject ? (
                  <>
                    <p className="font-medium">{item.subject.displayName}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {humanizeAuditValue(item.subject.type)}
                    </p>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>

              <td className="p-4">
                {item.actor ? (
                  <>
                    <p>{item.actor.displayName}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {humanizeAuditValue(item.actor.type)}
                    </p>
                  </>
                ) : (
                  <span className="text-muted-foreground">System</span>
                )}
              </td>

              <td className="p-4">
                {item.changes?.length ? (
                  <div className="space-y-2">
                    {item.changes.map((change) => (
                      <div key={change.field} className="text-xs">
                        <p className="font-medium">
                          {humanizeAuditValue(change.field)}
                        </p>

                        <p className="mt-1 text-muted-foreground">
                          {formatAuditValue(change.before)}
                          {" → "}
                          {formatAuditValue(change.after)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function humanizeAuditValue(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatAuditValue(value: AuditPrimitive) {
  if (value === null || value === undefined || value === "") {
    return "None";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

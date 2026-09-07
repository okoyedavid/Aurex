import type { ReactNode } from "react";

export function InvitationChoiceButton({
  active,
  compact = false,
  disabled,
  icon,
  title,
  description,
  onClick,
}: {
  active?: boolean;
  compact?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md border text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${compact ? "p-3" : "p-5"} ${
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : compact
            ? "border-border hover:border-primary/25"
            : "border-border hover:border-primary/35 hover:bg-primary/5"
      } focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}
    >
      <span
        className={
          compact
            ? "flex items-center gap-2 text-sm font-semibold"
            : "flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"
        }
      >
        {icon} {compact ? title : null}
      </span>
      {!compact ? <span className="mt-4 block font-semibold">{title}</span> : null}
      <span className={`mt-1 block text-muted-foreground ${compact ? "text-xs" : "text-sm leading-6"}`}>
        {description}
      </span>
    </button>
  );
}

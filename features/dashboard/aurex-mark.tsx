export function AurexMark() {
  return (
    <span
      className="grid h-10 w-10 shrink-0 grid-cols-2 gap-1 rounded-md bg-primary p-2"
      aria-hidden="true"
    >
      <span className="rounded-sm bg-primary-foreground" />
      <span className="rounded-sm bg-primary-foreground/55" />
      <span className="rounded-sm bg-primary-foreground/55" />
      <span className="rounded-sm bg-primary-foreground" />
    </span>
  );
}

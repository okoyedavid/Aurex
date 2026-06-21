export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span>or continue with email</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

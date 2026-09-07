import { cn } from "@/lib/utils";
import { employeeLabel } from "../employee-display-utils";

export function EmployeeDetailSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-6 shadow-sm sm:p-7">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-primary [&>svg]:size-4">{icon}</span>
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export type EmployeeDetailItem = {
  label: string;
  value: React.ReactNode;
  secondary?: React.ReactNode;
};

export function EmployeeDetails({ items }: { items: EmployeeDetailItem[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      {items.map((item) => <EmployeeDetailValue key={item.label} {...item} />)}
    </dl>
  );
}

export function EmployeeDetailValue({ label, value, secondary }: EmployeeDetailItem) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-medium">{value}</dd>
      {secondary ? <p className="mt-1 text-xs text-muted-foreground">{secondary}</p> : null}
    </div>
  );
}

export function EmployeeVerificationStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const verified = normalized === "verified" || normalized === "success";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-1.5 rounded-full", verified ? "bg-primary" : "bg-muted-foreground")} />
      {employeeLabel(status)}
    </span>
  );
}

import Link from "next/link";

import { cn } from "@/lib/utils";

const items = [
  ["Directory", ""],
  ["Departments", "/employee-lists"],
  ["Employee types", "/employees/types"],
  ["Employee groups", "/employees/groups"],
] as const;

export function EmployeeSubnavigation({
  businessId,
  current,
}: {
  businessId: string;
  current: "directory" | "departments" | "types" | "groups";
}) {
  return (
    <nav
      aria-label="Employee management"
      className="mb-7 flex gap-2 overflow-x-auto border-b border-border pb-3"
    >
      {items.map(([label, suffix]) => {
        const id =
          label === "Directory"
            ? "directory"
            : label === "Departments"
              ? "departments"
              : label === "Employee types"
                ? "types"
                : "groups";
        return (
          <Link
            key={label}
            href={`/business/${businessId}${suffix}`}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium",
              current === id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

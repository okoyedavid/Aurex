import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { SelectControl } from "@/components/ui/select";
import type {
  DemoEmployee,
  WarpDemoControls,
  WarpDemoMutation,
} from "@/lib/warp-demo/types";
import { fieldLabel, humanValue } from "./demo-presentation";

type EmployeePanelProps = {
  employee?: DemoEmployee;
  controls?: WarpDemoControls;
  selectedField: WarpDemoMutation["field"];
  selectedValue: string;
  setSelectedField: (value: WarpDemoMutation["field"]) => void;
  setSelectedValue: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  canApply: boolean;
  disabled: boolean;
  previousChange: string | null;
  error: Error | null;
};

export function EmployeePanel({
  employee,
  controls,
  selectedField,
  selectedValue,
  setSelectedField,
  setSelectedValue,
  onApply,
  onReset,
  canApply,
  disabled,
  previousChange,
  error,
}: EmployeePanelProps) {
  if (!employee) return <Loading label="Preparing live demo" />;
  const fields = (Object.keys(controls ?? {}) as WarpDemoMutation["field"][]).filter(
    (field) => (controls?.[field] ?? []).length,
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Employee snapshot
        </p>
        <h3 className="mt-2 text-2xl font-semibold">{employee.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {employee.jobTitle ?? "Employee"}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <Fact label="Department" value={employee.department} />
        <Fact label="Employee type" value={employee.employeeType ?? "Unassigned"} />
        <Fact label="State" value={employee.state ?? "Unassigned"} />
        <Fact label="Tenure" value={`${employee.tenureMonths} months`} />
        <Fact label="Groups" value={employee.groups.length ? employee.groups.join(", ") : "None"} />
      </dl>
      <div className="border-t border-border pt-5">
        <p className="text-sm font-semibold">Try a change</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium">
            Attribute
            <SelectControl
              value={selectedField}
              disabled={disabled}
              onChange={(event) =>
                setSelectedField(event.target.value as WarpDemoMutation["field"])
              }
            >
              {fields.map((field) => (
                <option key={field} value={field}>{fieldLabel(field)}</option>
              ))}
            </SelectControl>
          </label>
          <label className="text-xs font-medium">
            New value
            <SelectControl
              value={selectedValue}
              disabled={disabled}
              onChange={(event) => setSelectedValue(event.target.value)}
            >
              <option value="">Choose a value</option>
              {(controls?.[selectedField] ?? []).map((value) => (
                <option key={value} value={value}>{humanValue(value)}</option>
              ))}
            </SelectControl>
          </label>
        </div>
        {previousChange ? (
          <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs">
            {previousChange}{disabled ? " · Applying…" : ""}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={onApply} disabled={!canApply}>Apply change</Button>
          <Button variant="outline" onClick={onReset} disabled={disabled}>
            Reset demo <RotateCcw />
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
        {disabled && !previousChange ? (
          <p className="text-xs text-muted-foreground">
            Preparing the live demo before controls become available.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

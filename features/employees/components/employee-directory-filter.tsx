import { SelectControl } from "@/components/ui/select";

export function EmployeeDirectoryFilter({ label, value, onChange, items }: { label: string; value?: string; onChange: (value?: string) => void; items: string[][] }) {
  return <label><span className="sr-only">{label}</span><SelectControl className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={value ?? ""} onChange={(event) => onChange(event.target.value || undefined)}><option value="">{label}</option>{items.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</SelectControl></label>;
}

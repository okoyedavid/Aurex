import { SelectControl } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
export function Pagination({
  page,
  totalPages,
  total,
  limit,
  fetching,
  onPage,
  onLimit,
  showLimit = true,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  fetching: boolean;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
  showLimit?: boolean;
}) {
  if (total <= 0 || totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="text-muted-foreground">
        Page {page} of {Math.max(1, totalPages)} · {total} items{" "}
        {fetching && <span className="ml-2">Updating…</span>}
      </div>
      <div className="flex items-center gap-2">
        {showLimit ? <label>
          Rows{" "}
          <SelectControl
            className="h-8 w-20 rounded-md border border-input bg-background px-2"
            value={limit}
            onChange={(event) => onLimit(Number(event.target.value))}
          >
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </SelectControl>
        </label> : null}
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={page >= totalPages || fetching}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

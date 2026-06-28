import { getInitials } from "@/features/business/business-display-utils";
import type { BusinessListItem } from "@/lib/business-api";

export function BusinessLogo({ item }: { item: BusinessListItem }) {
  const business = item.business;

  if (business.profile_img) {
    return (
      <span
        aria-hidden="true"
        className="h-12 w-12 shrink-0 rounded-md bg-cover bg-center"
        style={{ backgroundImage: `url("${business.profile_img}")` }}
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
      {getInitials(business.name)}
    </div>
  );
}

import { BusinessSubnavigation } from "@/components/BusinessSubnavigation";
import { PageFrame } from "@/components/page-frame";
import { getBusinessSubnavigation } from "@/features/dashboard/data";

export default async function PoliciesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  const policyNavigation = getBusinessSubnavigation(businessId, "policies");

  return (
    <PageFrame>
      <BusinessSubnavigation
        ariaLabel="Policy sections"
        items={policyNavigation}
      />
      {children}
    </PageFrame>
  );
}

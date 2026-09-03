import { BusinessSubnavigation } from "@/components/BusinessSubnavigation";
import { PolicyPageFrame } from "@/features/policies/components/policy-ui";

export default async function PoliciesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  const policyNavigation = [
    {
      label: "Policies",
      href: `/business/${businessId}/policies`,
      exact: true,
    },
    {
      label: "Categories",
      href: `/business/${businessId}/policies/categories`,
    },
    {
      label: "Audit History",
      href: `/business/${businessId}/policies/audit`,
    },
  ];

  return (
    <PolicyPageFrame>
      <BusinessSubnavigation
        ariaLabel="Policy sections"
        items={policyNavigation}
      />
      {children}
    </PolicyPageFrame>
  );
}

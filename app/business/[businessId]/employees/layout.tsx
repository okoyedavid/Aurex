import { BusinessSubnavigation } from "@/components/BusinessSubnavigation";
import { PageFrame } from "@/components/page-frame";
import { getBusinessSubnavigation } from "@/features/dashboard/data";

export default async function EmployeesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  const employeeNavigation = getBusinessSubnavigation(
    businessId,
    "employees",
  );
  return (
    <PageFrame>
      <BusinessSubnavigation
        ariaLabel="Employee management"
        items={employeeNavigation}
      />{" "}
      {children}
    </PageFrame>
  );
}

import { BusinessSubnavigation } from "@/components/BusinessSubnavigation";
import { PageFrame } from "@/components/page-frame";

export default async function EmployeesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  const employeeNavigation = [
    {
      label: "Directory",
      href: `/business/${businessId}/employees`,
      exact: true,
    },
    {
      label: "Departments",
      href: `/business/${businessId}/employees/employee-lists`,
    },
    {
      label: "Employee types",
      href: `/business/${businessId}/employees/types`,
    },
    {
      label: "Employee groups",
      href: `/business/${businessId}/employees/groups`,
    },
  ];
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

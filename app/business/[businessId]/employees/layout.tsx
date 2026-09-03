import { BusinessSubnavigation } from "@/components/BusinessSubnavigation";
import { PolicyPageFrame } from "@/features/policies/components/policy-ui";

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
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <BusinessSubnavigation
          ariaLabel="Employee management"
          items={employeeNavigation}
        />{" "}
        {children}
      </div>
    </div>
  );
}

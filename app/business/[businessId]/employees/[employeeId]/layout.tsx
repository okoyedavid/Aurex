import { EmployeeDetailLayout } from "@/features/employees/employee-detail-layout";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string; employeeId: string }>;
}) {
  const { businessId, employeeId } = await params;

  return (
    <EmployeeDetailLayout businessId={businessId} employeeId={employeeId}>
      {children}
    </EmployeeDetailLayout>
  );
}

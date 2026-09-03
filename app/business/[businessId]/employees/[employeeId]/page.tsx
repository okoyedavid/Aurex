import { EmployeeDetailPage } from "@/features/employees/employee-detail-page";

export default async function Page({ params }: { params: Promise<{ businessId: string; employeeId: string }> }) {
  const { businessId, employeeId } = await params;
  return <EmployeeDetailPage businessId={businessId} employeeId={employeeId} />;
}

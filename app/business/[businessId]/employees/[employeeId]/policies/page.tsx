import { EmployeePoliciesDetailPage } from "@/features/employees/employee-policies-detail-page";

export default async function Page({ params }: { params: Promise<{ businessId: string; employeeId: string }> }) {
  const { businessId, employeeId } = await params;
  return <EmployeePoliciesDetailPage businessId={businessId} employeeId={employeeId} />;
}

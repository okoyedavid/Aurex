import { EmployeePoliciesPage } from "@/features/policies/employee-policies-page";

export default async function Page({ params }: { params: Promise<{ businessId: string; employeeListId: string; employeeId: string }> }) {
  const { businessId, employeeListId, employeeId } = await params;
  return <EmployeePoliciesPage businessId={businessId} employeeListId={employeeListId} employeeId={employeeId} />;
}

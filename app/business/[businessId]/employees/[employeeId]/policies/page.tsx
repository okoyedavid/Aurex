import { EmployeePolicies } from "@/features/policies/components/employee-policies";

export default async function Page({ params }: { params: Promise<{ businessId: string; employeeId: string }> }) {
  const { businessId, employeeId } = await params;
  return <EmployeePolicies businessId={businessId} employeeId={employeeId} />;
}

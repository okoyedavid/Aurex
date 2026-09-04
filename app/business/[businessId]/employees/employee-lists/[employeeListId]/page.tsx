import { EmployeeListDetailPage } from "@/features/business/employee-list-detail-page";
export default async function Page({
  params,
}: {
  params: Promise<{ businessId: string; employeeListId: string }>;
}) {
  const { businessId, employeeListId } = await params;
  return (
    <EmployeeListDetailPage
      businessId={businessId}
      employeeListId={employeeListId}
    />
  );
}

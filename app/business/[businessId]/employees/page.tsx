import { EmployeeDirectoryPage } from "@/features/employees/employee-directory-page";

export default async function Page({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <EmployeeDirectoryPage businessId={businessId} />;
}

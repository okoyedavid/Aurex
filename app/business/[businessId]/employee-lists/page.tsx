import { EmployeeListsPage } from "@/features/business/employee-lists-page";
export default async function Page({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <EmployeeListsPage businessId={businessId} />;
}

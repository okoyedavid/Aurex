import { EmployeeClassificationPage } from "@/features/employees/employee-classification-page";

export default async function Page({ params }: { params: Promise<{ businessId: string }> }) { const { businessId } = await params; return <EmployeeClassificationPage businessId={businessId} kind="types" />; }

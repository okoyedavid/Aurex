import { redirect } from "next/navigation";
import { canonicalEmployeePoliciesHref } from "@/features/employees/employee-directory-utils";

export default async function Page({ params }: { params: Promise<{ businessId: string; employeeListId: string; employeeId: string }> }) {
  const { businessId, employeeId } = await params;
  redirect(canonicalEmployeePoliciesHref(businessId, employeeId));
}

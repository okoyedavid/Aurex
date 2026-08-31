import { PolicyAuditPage } from "@/features/policies/policy-audit-page";

export default async function Page({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  return <PolicyAuditPage businessId={businessId} />;
}

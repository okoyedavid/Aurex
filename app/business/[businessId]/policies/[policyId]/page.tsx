import { PolicyDetailPage } from "@/features/policies/policy-detail-page";

export default async function Page({ params }: { params: Promise<{ businessId: string; policyId: string }> }) {
  const { businessId, policyId } = await params;
  return <PolicyDetailPage businessId={businessId} policyId={policyId} />;
}

import { PolicyOverviewPage } from "@/features/policies/policy-overview-page";

export default async function Page({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <PolicyOverviewPage businessId={businessId} />;
}

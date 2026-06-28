import { BusinessMembersPage } from "@/features/business/business-members-page";

export default async function Page({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <BusinessMembersPage businessId={businessId} />;
}

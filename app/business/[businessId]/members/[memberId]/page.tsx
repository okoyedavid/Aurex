import { BusinessMemberDetailPage } from "@/features/business/business-member-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ businessId: string; memberId: string }>;
}) {
  const { businessId, memberId } = await params;
  return (
    <BusinessMemberDetailPage businessId={businessId} memberId={memberId} />
  );
}

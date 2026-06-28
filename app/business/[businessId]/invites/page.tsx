import { BusinessSectionPage } from "@/features/dashboard/business-section-page";

export default async function BusinessInvitesPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  return <BusinessSectionPage businessId={businessId} section="invites" />;
}

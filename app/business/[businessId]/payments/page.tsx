import { BusinessSectionPage } from "@/features/dashboard/business-section-page";

export default async function BusinessPaymentsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <BusinessSectionPage businessId={businessId} section="payments" />;
}

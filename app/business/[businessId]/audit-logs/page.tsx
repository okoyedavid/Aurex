import { BusinessAuditPage } from "@/features/audit/business-audit-page";

export default async function BusinessAuditLogsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  return <BusinessAuditPage businessId={businessId} />;
}

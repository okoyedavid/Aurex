import { BusinessInvitesPage as Invites } from "@/features/access/business-invites-page";

export default async function BusinessInvitesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <Invites businessId={businessId} />;
}

import { BusinessRolesPage as Roles } from "@/features/access/business-roles-page";

export default async function BusinessRolesPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  return <Roles businessId={businessId} />;
}

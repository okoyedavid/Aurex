import { CategoriesOverviewPage } from "@/features/policies/categories-overview-page";

export default async function Page({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <CategoriesOverviewPage businessId={businessId} />;
}

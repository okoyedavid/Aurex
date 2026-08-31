import { CategoryDetailPage } from "@/features/policies/category-detail-page";

export default async function Page({ params }: { params: Promise<{ businessId: string; categoryId: string }> }) {
  const { businessId, categoryId } = await params;
  return <CategoryDetailPage businessId={businessId} categoryId={categoryId} />;
}

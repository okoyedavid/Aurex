import { ScopedThemeProvider } from "@/components/theme-provider";
import { BusinessAccessBoundary } from "@/features/business/business-access-boundary";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<unknown>;
}) {
  const { businessId } = (await params) as { businessId: string };

  return (
    <ScopedThemeProvider>
      <BusinessAccessBoundary businessId={businessId}>
        {children}
      </BusinessAccessBoundary>
    </ScopedThemeProvider>
  );
}

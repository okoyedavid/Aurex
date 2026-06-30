export function BusinessSettingsPageFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </div>
  );
}

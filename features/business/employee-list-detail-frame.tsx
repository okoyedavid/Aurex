export function EmployeeListDetailFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </div>
  );
}

import { PageFrame } from "@/components/page-frame";

export default async function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageFrame>{children}</PageFrame>;
}

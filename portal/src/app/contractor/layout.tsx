import { AssignmentProvider } from "@/context/AssignmentContext";

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AssignmentProvider>{children}</AssignmentProvider>;
}

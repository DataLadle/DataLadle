import { AdminTopBar } from "@/components/AdminTopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <AdminTopBar />
      {children}
    </div>
  );
}

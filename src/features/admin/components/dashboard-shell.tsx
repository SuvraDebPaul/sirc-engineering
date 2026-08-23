import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminTopbar } from "@/features/admin/components/admin-topbar";

export function DashboardShell({
  children,
  logoUrl,
  user,
}: {
  children: React.ReactNode;
  logoUrl?: string;
  user: { name: string; email: string; role: string };
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar logoUrl={logoUrl} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar logoUrl={logoUrl} user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

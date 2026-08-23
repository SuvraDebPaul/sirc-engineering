import { AdminNavLinks } from "@/features/admin/components/admin-nav-links";
import Logo from "@/components/layout/logo";

/**
 * Fixed desktop sidebar. Server Component — the only interactive piece is
 * `AdminNavLinks` (needs the current path), so that's the only part that
 * pays for hydration.
 */
export function AdminSidebar({ logoUrl }: { logoUrl?: string }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
        <Logo url="/admin" src={logoUrl} className="h-9 w-auto" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <AdminNavLinks />
      </div>

      <div className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/50">
        SIRC Admin
      </div>
    </aside>
  );
}

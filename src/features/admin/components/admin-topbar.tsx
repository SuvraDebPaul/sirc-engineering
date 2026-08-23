import { Search } from "lucide-react";

import { AdminMobileSidebar } from "@/features/admin/components/admin-mobile-sidebar";
import { UserMenu } from "@/features/admin/components/user-menu";

export function AdminTopbar({
  logoUrl,
  user,
}: {
  logoUrl?: string;
  user: { name: string; email: string; role: string };
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:px-8">
      <AdminMobileSidebar logoUrl={logoUrl} />

      {/* Disabled rather than wired to nothing — there is no search index to
          query yet, and a search box that silently does nothing is worse
          than one that visibly isn't ready. */}
      <div className="hidden flex-1 sm:block">
        <label className="relative block max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search…"
            disabled
            aria-label="Search (coming soon)"
            className="h-10 w-full rounded-lg border border-input bg-transparent pr-3 pl-9 text-sm text-muted-foreground placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <UserMenu name={user.name} email={user.email} role={user.role} />
      </div>
    </header>
  );
}

import Link from "next/link";
import { LayoutDashboard, Heart, MapPin, Package } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { AccountMenu } from "@/features/account/components/account-menu";
import { requireSession } from "@/lib/require-session";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
];

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const session = await requireSession();

  return (
    <>
      <PageHeader
        title="My account"
        description={`Signed in as ${session.user.email}`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "My account" }]}
      />

      <Container className="grid gap-8 pb-20 lg:grid-cols-[14rem_1fr]">
        <aside className="space-y-4">
          <div className="flex items-center gap-2.5 rounded-lg border p-3">
            <AccountMenu name={session.user.name} email={session.user.email} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{session.user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{session.user.email}</span>
            </span>
          </div>

          <nav className="space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </Container>
    </>
  );
}

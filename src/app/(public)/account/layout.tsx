import Link from "next/link";
import { LayoutDashboard, Heart, MapPin, Package } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { SignOutButton } from "@/features/account/components/sign-out-button";
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
        <aside className="space-y-1">
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

          <div className="pt-2">
            <SignOutButton />
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </Container>
    </>
  );
}

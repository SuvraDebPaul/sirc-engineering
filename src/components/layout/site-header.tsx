import Link from "next/link";
import { headers } from "next/headers";
import { FileText, Mail, Phone, User } from "lucide-react";

import { AccountMenu } from "@/features/account/components/account-menu";
import { CartControls } from "@/features/cart/components/cart-drawer";
import { Container } from "@/components/layout/container";
import Logo from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";
import { getCategories, getProducts } from "@/features/catalog/services";
import { getSiteSettings } from "@/features/settings/services/settings";
import { auth } from "@/lib/db/auth";

export async function SiteHeader() {
  const [categories, products, settings, session] = await Promise.all([
    getCategories(),
    getProducts(),
    getSiteSettings(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  // Counts tell the mobile drawer which categories actually hold stock, so an
  // empty one is visibly marked rather than discovered by tapping it.
  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.categoryName] = (counts[product.categoryName] ?? 0) + 1;
  }

  return (
    <header>
      {/* Row 1 — utility strip */}
      <div className="border-b bg-muted/40 text-xs">
        <Container className="flex h-10 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <Phone className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{settings.phone}</span>
            </a>

            <a
              href={`mailto:${settings.email}`}
              className="hidden items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary sm:flex"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{settings.email}</span>
            </a>
          </div>

          <nav aria-label="Secondary" className="hidden shrink-0 sm:block">
            <ul className="flex items-center gap-4">
              <li>
                {session ? (
                  <AccountMenu
                    name={session.user.name}
                    email={session.user.email}
                  />
                ) : (
                  <Link
                    href={"/login"}
                    className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:text-primary"
                  >
                    <User className="size-3.5 shrink-0" aria-hidden="true" />
                    Sign in
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </Container>
      </div>

      {/* Row 2 — masthead and main navigation, sticky */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <Container className="flex items-center gap-6 py-3">
          <Logo
            src={settings.logoUrl ?? undefined}
            className="h-12 w-auto shrink-0"
          />

          <nav aria-label="Main" className="hidden min-w-0 lg:block">
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  href="/"
                  className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Home
                </Link>
              </li>

              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <CartControls />

            <Button asChild size="lg" className="hidden sm:inline-flex">
              <Link href="/rfq">
                <FileText className="size-4" aria-hidden="true" />
                <span className="hidden md:inline">Request a quotation</span>
                <span className="md:hidden">Quote</span>
              </Link>
            </Button>

            <div className="lg:hidden">
              <MobileNav
                nav={mainNav}
                categories={categories}
                counts={counts}
                phone={settings.phone}
                logoUrl={settings.logoUrl ?? undefined}
              />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}

export { SiteHeader as MainMenuBar };

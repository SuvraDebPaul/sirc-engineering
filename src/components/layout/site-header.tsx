import Link from "next/link";
import { FileText, Mail, Phone } from "lucide-react";

import { CartControls } from "@/features/cart/components/cart-drawer";
import { Container } from "@/components/layout/container";
import Logo from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { mainNav, utilityNav } from "@/config/site";
import {
  getCategories,
  getProducts,
} from "@/features/catalog/services";
import { getSiteSettings } from "@/features/settings/services/settings";

/**
 * Site header — two rows.
 *
 * Row one is the utility strip: how to reach us on the left, secondary links
 * and sign-in on the right. Row two is the masthead and the main navigation,
 * which sticks to the top on scroll — pure CSS, no scroll listener.
 *
 * A server component. The only client pieces are the cart controls and the
 * mobile drawer, both of which genuinely need interaction state.
 *
 * The catalogue search and the "shop by categories" mega menu were both
 * removed at the client's request. Categories remain reachable from the mobile
 * drawer, the footer and the category facet on `/products`; the `?q=`
 * parameter still works and is still tested, it simply has no control in the
 * chrome any more.
 */
export async function SiteHeader() {
  const [categories, products, settings] = await Promise.all([
    getCategories(),
    getProducts(),
    getSiteSettings(),
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

          {/*
            No customer "Login" link. This used to point at a placeholder
            account page; that page is gone now that /admin/login is a real
            staff-only sign-in. Pointing a public nav link at it would be
            wrong twice over — customers have no accounts to log into, and it
            would advertise the admin entrance to every visitor. Bring a
            customer-facing login back here only when there's a real
            customer-account system for it to lead to.
          */}
          <nav aria-label="Secondary" className="hidden shrink-0 sm:block">
            <ul className="flex items-center gap-4">
              {utilityNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="whitespace-nowrap text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      {/* Row 2 — masthead and main navigation, sticky */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <Container className="flex items-center gap-6 py-3">
          <Logo src={settings.logoUrl ?? undefined} className="h-12 w-auto shrink-0" />

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

import Link from "next/link";
import { FileText, LogIn, Mail, Phone } from "lucide-react";

import { CartControls } from "@/components/cart/cart-drawer";
import { Container } from "@/components/layout/container";
import Logo from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { contactInfo, mainNav, utilityNav } from "@/config/site";
import { getCategories, getProducts } from "@/lib/api";

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
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

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
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <Phone className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{contactInfo.phone}</span>
            </a>

            <a
              href={`mailto:${contactInfo.email}`}
              className="hidden items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary sm:flex"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{contactInfo.email}</span>
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <nav aria-label="Secondary" className="hidden sm:block">
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

            <span aria-hidden="true" className="hidden h-3.5 w-px bg-border sm:block" />

            <Link
              href="/login"
              className="flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <LogIn className="size-3.5 shrink-0" aria-hidden="true" />
              Login
            </Link>
          </div>
        </Container>
      </div>

      {/* Row 2 — masthead and main navigation, sticky */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <Container className="flex items-center gap-6 py-3">
          <Logo className="h-12 w-auto shrink-0" />

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
              <MobileNav nav={mainNav} categories={categories} counts={counts} />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}

export { SiteHeader as MainMenuBar };

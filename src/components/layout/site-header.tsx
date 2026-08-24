import Link from "next/link";
import { headers } from "next/headers";
import { FileText, Mail, Phone, SearchIcon, User } from "lucide-react";

import { AccountMenu } from "@/features/account/components/account-menu";
import { AnimatedNavLinks } from "@/components/layout/animated-nav-links";
import { CartControls } from "@/features/cart/components/cart-drawer";
import { Container } from "@/components/layout/container";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import Logo from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";
import { getCategories, getProducts } from "@/features/catalog/services";
import { getSiteSettings } from "@/features/settings/services/settings";
import { auth } from "@/lib/db/auth";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

export async function SiteHeader() {
  const [categories, products, settings, session] = await Promise.all([
    getCategories(),
    getProducts(),
    getSiteSettings(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.categoryName] = (counts[product.categoryName] ?? 0) + 1;
  }

  return (
    <>
      <header>
        {/* Row 1 — utility strip */}
        <div className="border-b text-xs">
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
            <div className="w-full max-w-lg">
              <InputGroup className="rounded-full px-2 h-8">
                <InputGroupInput placeholder="Search..." />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
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
                      className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:text-primary border rounded-full px-6 py-2 bg-background hover:bg-muted"
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

        {/* Row 2 — masthead and main navigation. Not sticky: once this scrolls
            out of view, `FloatingNavbar` takes over as the condensed, pinned
            nav rather than this whole row staying pinned underneath it. */}
        <div className="border-b bg-[#F5F5F5]">
          <Container className="flex items-center justify-between gap-6 py-1">
            <Logo src={settings.logoUrl ?? undefined} className="h-16 w-auto" />

            <nav
              aria-label="Main"
              className="hidden min-w-0 lg:block bg-white px-3 py-2 rounded-full"
            >
              <AnimatedNavLinks items={mainNav} layoutId="main-nav-pill" />
            </nav>

            <div className="flex items-center gap-2">
              <CartControls />

              <Button
                asChild
                size="lg"
                variant={"outline"}
                className="hidden sm:inline-flex rounded-full px-6 hover:text-primary hover:border-primary"
              >
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

      <FloatingNavbar
        nav={mainNav}
        categories={categories}
        counts={counts}
        phone={settings.phone}
        logoUrl={settings.logoUrl ?? undefined}
      />
    </>
  );
}

export { SiteHeader as MainMenuBar };

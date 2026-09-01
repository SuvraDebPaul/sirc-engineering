import Link from "next/link";
import { headers } from "next/headers";
import { FileText, Mail, Phone, User } from "lucide-react";

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
import { SearchBar } from "@/components/layout/search-bar";

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
      <header className="relative z-40 bg-background">
        {/* Row 1 — Utility Strip with accreditation tag, direct hotline & global search */}
        <div className="border-b border-border/60 bg-muted/40 py-1.5 text-xs text-muted-foreground">
          <Container className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Left: Hotline & Status */}
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              {/* <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                ISO 17025 Accredited Lab
              </div> */}

              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-1.5 text-foreground/80 font-medium transition-colors hover:text-primary"
                aria-label={`Call ${settings.phone}`}
              >
                <Phone
                  className="size-3.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="truncate">{settings.phone}</span>
              </a>

              <a
                href={`mailto:${settings.email}`}
                className="hidden xl:flex items-center gap-1.5 transition-colors hover:text-primary"
                aria-label={`Email ${settings.email}`}
              >
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{settings.email}</span>
              </a>
            </div>

            {/* Center: Search Bar */}
            <SearchBar className="min-w-0 flex-1 max-w-sm sm:max-w-md lg:max-w-3xl lg:-ml-40" />

            {/* Right: User Auth / Account */}
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/corporate"
                className="hidden md:inline-block text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Corporate Sales
              </Link>

              <span
                className="hidden md:inline-block h-3.5 w-px bg-border/80"
                aria-hidden="true"
              />

              {session ? (
                <AccountMenu
                  name={session.user.name}
                  email={session.user.email}
                />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3.5 py-1 text-xs font-medium text-foreground transition-all duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary shadow-2xs"
                >
                  <User className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </Container>
        </div>

        {/* Row 2 — Main Masthead & Navigation */}
        <div className="border-b border-border/70 bg-background/95 backdrop-blur-md">
          <Container className="flex items-center justify-between gap-4 py-2.5 sm:py-3">
            {/* Logo area */}
            <div className="flex items-center gap-3.5">
              <Logo
                src={settings.logoUrl ?? undefined}
                className="h-10 sm:h-12 w-auto"
              />
              <div className="hidden 2xl:flex flex-col border-l border-border/60 pl-3">
                <span className="font-bold tracking-wider text-foreground uppercase ">
                  SIRC Engineering
                </span>
                <span className="text-xs text-muted-foreground">
                  Industrial Service Provider
                </span>
              </div>
            </div>

            {/* Main Navigation Links */}
            <nav aria-label="Main" className="hidden min-w-0 lg:block">
              <AnimatedNavLinks items={mainNav} layoutId="main-nav-pill" />
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <CartControls />

              <Button
                asChild
                size="default"
                className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 font-semibold shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
              >
                <Link href="/rfq">
                  <FileText className="size-4" aria-hidden="true" />
                  <span className="hidden md:inline">Request Quotation</span>
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

      {/* Scrolled Floating Navigation Pill */}
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

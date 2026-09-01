"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

import { AnimatedNavLinks } from "@/components/layout/animated-nav-links";
import Logo from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartControls } from "@/features/cart/components/cart-drawer";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/config/site";
import type { Category } from "@/features/catalog/types";

export function FloatingNavbar({
  nav,
  categories,
  counts,
  phone,
  logoUrl,
}: {
  nav: NavItem[];
  categories: Category[];
  counts: Record<string, number>;
  phone: string;
  logoUrl?: string;
}) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 180);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/80 bg-background/90 py-1.5 pl-3 pr-2 shadow-xl shadow-black/10 backdrop-blur-2xl ring-1 ring-black/5">
            {/* Mini Logo */}
            <Link href="/" className="shrink-0 flex items-center pr-1" aria-label="SIRC Home">
              <Logo src={logoUrl} className="h-8 w-auto" />
            </Link>

            <div className="hidden h-5 w-px bg-border/80 lg:block" aria-hidden="true" />

            {/* Main Links */}
            <nav aria-label="Floating Navigation" className="hidden lg:block">
              <AnimatedNavLinks
                items={nav}
                layoutId="floating-nav-pill"
                linkClassName="h-8 px-3.5 text-xs font-medium"
              />
            </nav>

            <div className="lg:hidden">
              <MobileNav
                nav={nav}
                categories={categories}
                counts={counts}
                phone={phone}
                logoUrl={logoUrl}
              />
            </div>

            <div className="hidden h-5 w-px bg-border/80 lg:block" aria-hidden="true" />

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <CartControls />

              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold shadow-xs"
              >
                <Link href="/rfq">
                  <FileText className="size-3.5" aria-hidden="true" />
                  <span>Quote</span>
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

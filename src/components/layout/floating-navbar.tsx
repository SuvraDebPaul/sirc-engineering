"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

import { AnimatedNavLinks } from "@/components/layout/animated-nav-links";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartControls } from "@/features/cart/components/cart-drawer";
import type { NavItem } from "@/config/site";
import type { Category } from "@/features/catalog/types";

/**
 * The condensed nav that takes over once the full masthead has scrolled out
 * of view — nav links, wishlist and cart only, nothing else. The masthead
 * itself is *not* sticky; this is a second, separate bar that Framer Motion
 * fades and drops in past a scroll threshold, so there is never a moment
 * with two navbars fighting for the same pinned position.
 *
 * A floating pill rather than an edge-to-edge bar on purpose — `top-0
 * inset-x-0` reads as the browser chrome; a bar with margin on every side
 * reads as a deliberately designed piece of UI.
 */
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
    setVisible(latest > 160);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
        >
          <div className="flex items-center gap-2 rounded-full border border-gray-200/70 bg-white/80 py-1.5 pr-2 pl-1.5 shadow-lg shadow-black/5 backdrop-blur-xl supports-backdrop-filter:bg-white/70">
            <nav aria-label="Main" className="hidden lg:block">
              <AnimatedNavLinks items={nav} layoutId="floating-nav-pill" linkClassName="h-8 px-3" />
            </nav>

            <div className="lg:hidden">
              <MobileNav nav={nav} categories={categories} counts={counts} phone={phone} logoUrl={logoUrl} />
            </div>

            <div className="hidden h-6 w-px bg-border lg:block" aria-hidden="true" />

            <CartControls />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

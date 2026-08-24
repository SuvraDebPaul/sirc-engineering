"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/site";

/**
 * Main nav, with a highlight pill that slides between items on hover.
 *
 * One shared component for both the masthead nav and the floating scrolled
 * nav, so the interaction reads as one design decision rather than two navs
 * that happen to look similar. Each instance needs its own `layoutId` —
 * sharing one across two simultaneously-mounted navs would make Framer
 * Motion fly the pill across the page between them, which is exactly the
 * "shared layout" trick used *within* one nav and a bug used *across* two.
 */
export function AnimatedNavLinks({
  items,
  layoutId,
  className,
  linkClassName,
}: {
  items: NavItem[];
  layoutId: string;
  className?: string;
  linkClassName?: string;
}) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  const allItems: NavItem[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <ul className={cn("flex items-center gap-0.5", className)} onMouseLeave={() => setHovered(null)}>
      {allItems.map((item) => {
        const active = pathname === item.href;
        const highlighted = hovered ? hovered === item.href : active;

        return (
          <li key={item.href} className="relative" onMouseEnter={() => setHovered(item.href)}>
            {highlighted && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-muted"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <Link
              href={item.href}
              className={cn(
                "relative z-10 inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                linkClassName,
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

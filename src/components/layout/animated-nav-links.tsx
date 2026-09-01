"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/site";

/**
 * Main nav, with a highlight pill that slides smoothly between items on hover/active.
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
    <ul
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHovered(null)}
    >
      {allItems.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const isHovered = hovered === item.href;
        const showPill = isHovered || (hovered === null && active);

        return (
          <li
            key={item.href}
            className="relative"
            onMouseEnter={() => setHovered(item.href)}
          >
            {showPill && (
              <motion.span
                layoutId={layoutId}
                className={cn(
                  "absolute inset-0 rounded-full",
                  active
                    ? "bg-background shadow-xs border border-border/60"
                    : "bg-muted/70",
                )}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Link
              href={item.href}
              className={cn(
                "relative z-10 inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-150",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
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

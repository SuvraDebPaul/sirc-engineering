"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type {
  Promotion,
  PromoTone,
} from "@/features/content/types";

/**
 * Promotional banner.
 *
 * One component covers both the half-width pair and the full-width band —
 * `size` changes the aspect ratio and type scale, nothing else. Two nearly
 * identical banner components would drift apart within a month.
 *
 * The photo sits in an oversized wrapper (`-inset-y-1/4`, clipped by the
 * card's own `overflow-hidden`) and drifts vertically against scroll
 * progress, so it moves at a different rate than the page around it instead
 * of being pinned flat to it — the classic parallax read of depth. Driven by
 * scroll position, not device motion, so it costs nothing until the card is
 * actually near the viewport.
 */
const TONE_SCRIM: Record<PromoTone, string> = {
  dark: "from-black/85 via-black/50 to-transparent",
  slate: "from-slate-900/90 via-slate-900/50 to-transparent",
  amber: "from-amber-500/95 via-amber-500/55 to-transparent",
  brand: "from-primary/90 via-primary/50 to-transparent",
};

/** Amber is a light ground — dark text on it, white on everything else. */
const TONE_TEXT: Record<PromoTone, string> = {
  dark: "text-white",
  slate: "text-white",
  amber: "text-amber-950",
  brand: "text-primary-foreground",
};

const TONE_BADGE: Record<PromoTone, string> = {
  dark: "border-white/25 bg-white/10 text-white",
  slate: "border-white/25 bg-white/10 text-white",
  amber: "border-amber-950/15 bg-amber-950/10 text-amber-950",
  brand: "border-white/25 bg-white/15 text-primary-foreground",
};

export function PromoBanner({
  promotion,
  size = "half",
  className,
}: {
  promotion: Promotion;
  size?: "half" | "wide";
  className?: string;
}) {
  const text = TONE_TEXT[promotion.tone];
  const cardRef = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <Link
      ref={cardRef}
      href={promotion.href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
        size === "wide" ? "aspect-2/1 sm:aspect-[3.4/1]" : "aspect-2/1 sm:aspect-[2.4/1]",
        className,
      )}
    >
      <motion.div
        style={reducedMotion ? undefined : { y: imageY }}
        className="absolute inset-x-0 -top-[12%] -bottom-[12%]"
      >
        <Image
          src={promotion.imageUrl}
          alt=""
          fill
          sizes={size === "wide" ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 768px) 50vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
        />
      </motion.div>

      <div
        aria-hidden="true"
        className={cn("absolute inset-0 bg-linear-to-r", TONE_SCRIM[promotion.tone])}
      />

      <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 sm:p-8">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm sm:text-xs",
            TONE_BADGE[promotion.tone],
          )}
        >
          {promotion.eyebrow}
        </span>

        <h3
          className={cn(
            "font-semibold leading-tight text-balance",
            text,
            size === "wide" ? "max-w-xl text-xl sm:text-3xl" : "max-w-xs text-lg sm:text-2xl",
          )}
        >
          {promotion.title}
        </h3>

        {promotion.subtitle && (
          <p className={cn("max-w-sm text-xs sm:text-sm", text, "opacity-80")}>
            {promotion.subtitle}
          </p>
        )}

        <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground shadow-lg shadow-black/10 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none sm:text-sm">
          {promotion.ctaLabel}
          <ArrowUpRight
            className="size-3.5 transition-transform duration-300 group-hover:rotate-45"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
 */
const TONE_SCRIM: Record<PromoTone, string> = {
  dark: "from-black/85 via-black/55 to-transparent",
  slate: "from-slate-900/90 via-slate-900/55 to-transparent",
  amber: "from-amber-500/95 via-amber-500/60 to-transparent",
  brand: "from-primary/90 via-primary/55 to-transparent",
};

/** Amber is a light ground — dark text on it, white on everything else. */
const TONE_TEXT: Record<PromoTone, string> = {
  dark: "text-white",
  slate: "text-white",
  amber: "text-amber-950",
  brand: "text-primary-foreground",
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

  return (
    <Link
      href={promotion.href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
        size === "wide" ? "aspect-2/1 sm:aspect-[3.4/1]" : "aspect-2/1 sm:aspect-[2.4/1]",
        className,
      )}
    >
      <Image
        src={promotion.imageUrl}
        alt=""
        fill
        sizes={size === "wide" ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 768px) 50vw, 100vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
      />

      <div
        aria-hidden="true"
        className={cn("absolute inset-0 bg-linear-to-r", TONE_SCRIM[promotion.tone])}
      />

      <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6 sm:p-8">
        <p className={cn("text-[11px] font-semibold uppercase tracking-widest sm:text-xs", text, "opacity-80")}>
          {promotion.eyebrow}
        </p>

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

        <span
          className={cn(
            "mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground shadow-sm transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none sm:text-sm",
          )}
        >
          {promotion.ctaLabel}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

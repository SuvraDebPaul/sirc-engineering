"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Quote,
  ShieldCheck,
  Star,
} from "lucide-react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Testimonial as TestimonialType } from "@/features/content/types";

const INTERVAL_MS = 6500;

export function Testimonial({
  testimonials,
  imageUrl = "/images/catalog/testimonial-panel.jpg",
}: {
  testimonials: TestimonialType[];
  imageUrl?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);

  const count = testimonials.length;

  const goTo = useCallback((next: number) => {
    setIndex(next);
    setStopped(true);
  }, []);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % count);
    setStopped(true);
  }, [count]);

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + count) % count);
    setStopped(true);
  }, [count]);

  useEffect(() => {
    if (reducedMotion || paused || stopped || count <= 1) return;

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reducedMotion, paused, stopped, count]);

  if (count === 0) return null;

  const active = testimonials[Math.min(index, count - 1)]!;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid lg:grid-cols-12">
        {/* Left Visual Anchor Panel (5 cols) */}
        <div className="relative aspect-4/3 sm:aspect-16/10 lg:aspect-auto lg:col-span-5 lg:min-h-[32rem] overflow-hidden border-b lg:border-b-0 lg:border-r border-border/60">
          <Image
            src={imageUrl}
            alt="SIRC Engineering Industrial Testing"
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />

          {/* Cinematic Scrim */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/20"
          />

          {/* Top Rating Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 backdrop-blur-md shadow-md">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-semibold text-white">4.9 / 5.0 Rating</span>
            </div>
          </div>

          {/* Bottom Trust Card Overlay */}
          <div className="absolute bottom-4 inset-x-4 z-10">
            <div className="rounded-2xl border border-white/20 bg-black/60 p-3.5 backdrop-blur-md text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                <span>Trusted by 500+ Industrial Facilities</span>
              </div>
              <p className="mt-1 text-[11px] text-white/80 leading-relaxed">
                Power generation, pharmaceuticals, textile mills, and engineering plants nationwide.
              </p>
            </div>
          </div>
        </div>

        {/* Right Testimonial Slider Panel (7 cols) */}
        <div className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 lg:col-span-7 bg-linear-to-b from-card via-card to-muted/20">
          {/* Header & Category Badge */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Quote className="size-3.5 fill-current" aria-hidden="true" />
                Client Testimonials
              </span>

              {/* Navigation Arrows */}
              {count > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous testimonial"
                    className="grid size-8.5 place-items-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-xs transition-all hover:scale-105 hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next testimonial"
                    className="grid size-8.5 place-items-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-xs transition-all hover:scale-105 hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <h2
              id="testimonials-heading"
              className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight"
            >
              What Engineering Teams Say About SIRC
            </h2>
          </div>

          {/* Animated Quote Content */}
          <div className="my-6 min-h-[14rem] sm:min-h-[12rem] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.figure
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex flex-col"
                aria-live="polite"
                aria-atomic="true"
              >
                {/* 5-Star Score */}
                <div className="flex gap-1 text-amber-400 mb-3" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>

                <p className="text-lg sm:text-xl font-bold leading-snug text-foreground text-balance">
                  “{active.headline}”
                </p>

                <blockquote className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {active.quote}
                </blockquote>

                {/* Author Signature */}
                <figcaption className="mt-6 flex items-center gap-3.5 border-t border-border/60 pt-4">
                  {active.imageUrl ? (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-primary/30">
                      <Image src={active.imageUrl} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-primary/20 bg-primary/10 text-sm font-bold text-primary shadow-xs"
                    >
                      {active.authorName
                        .split(/\s+/)
                        .map((part) => part[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold text-foreground text-sm sm:text-base">
                        {active.authorName}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                        Verified Client
                      </span>
                    </div>
                    <span className="block truncate text-xs text-muted-foreground mt-0.5">
                      {active.authorRole} · <span className="font-medium text-foreground/80">{active.company}</span>
                    </span>
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Footer Dots / Segmented Indicator */}
          {count > 1 && (
            <div className="flex items-center gap-2 pt-2" role="tablist" aria-label="Choose a testimonial">
              {testimonials.map((testimonial, i) => (
                <button
                  key={testimonial.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Testimonial ${i + 1} of ${count}: ${testimonial.authorName}`}
                  onClick={() => goTo(i)}
                  className="group relative flex h-6 items-center py-2"
                >
                  <span
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === index
                        ? "w-8 bg-primary"
                        : "w-2.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/60",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

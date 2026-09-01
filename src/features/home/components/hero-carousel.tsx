"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Promotion } from "@/features/content/types";

const AUTOPLAY_DELAY_MS = 6500;

/** Staggered entrance for the text block — each line arrives with smooth easing */
const CONTENT_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HeroCarousel({ slides }: { slides: Promotion[] }) {
  const reducedMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [
      Autoplay({
        delay: AUTOPLAY_DELAY_MS,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Stop the autoplay plugin outright when reduced motion is preferred
  useEffect(() => {
    if (!emblaApi || !reducedMotion) return;
    const autoplay = emblaApi.plugins()?.autoplay;
    autoplay?.stop();
  }, [emblaApi, reducedMotion]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden bg-black"
      aria-roledescription="carousel"
      aria-label="Featured Instruments & Promotions"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => {
            const isActive = selected === index;

            return (
              <div
                key={slide.id}
                className="relative min-w-0 flex-[0_0_100%]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}`}
              >
                <div className="relative h-[520px] w-full sm:h-[600px] lg:h-[680px]">
                  {/* Background Image with slow cinematic zoom */}
                  <Image
                    src={slide.imageUrl}
                    alt=""
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className={cn(
                      "object-cover transition-transform duration-1000 ease-out",
                      isActive ? "scale-105" : "scale-100",
                    )}
                  />

                  {/* Multi-layered cinematic gradient scrim */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-r from-black/95 via-black/70 to-black/40"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-black/30 to-black/80"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-black/90 via-black/40 to-transparent"
                  />

                  {/* Slide Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full px-6 sm:px-10 lg:px-16 max-w-5xl mx-auto">
                      <motion.div
                        initial={reducedMotion ? undefined : "hidden"}
                        animate={
                          reducedMotion
                            ? undefined
                            : isActive
                              ? "visible"
                              : "hidden"
                        }
                        variants={reducedMotion ? undefined : CONTENT_VARIANTS}
                        className="text-center"
                      >
                        {/* Eyebrow Badge */}
                        <motion.div
                          variants={reducedMotion ? undefined : ITEM_VARIANTS}
                          className="flex justify-center"
                        >
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-300 shadow-sm backdrop-blur-md">
                            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                            <ShieldCheck className="size-3.5" aria-hidden="true" />
                            {slide.eyebrow}
                          </span>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h2
                          variants={reducedMotion ? undefined : ITEM_VARIANTS}
                          className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1] text-balance"
                        >
                          {slide.title}
                        </motion.h2>

                        {/* Subtitle */}
                        {slide.subtitle && (
                          <motion.p
                            variants={reducedMotion ? undefined : ITEM_VARIANTS}
                            className="mt-4 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed text-white/85 text-balance"
                          >
                            {slide.subtitle}
                          </motion.p>
                        )}

                        {/* CTAs */}
                        <motion.div
                          variants={reducedMotion ? undefined : ITEM_VARIANTS}
                          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
                        >
                          <Button
                            asChild
                            size="lg"
                            className="group h-12 rounded-full px-7 font-semibold shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-primary/50"
                          >
                            <Link href={slide.href}>
                              <span>{slide.ctaLabel}</span>
                              <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                aria-hidden="true"
                              />
                            </Link>
                          </Button>

                          <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-12 rounded-full border-white/30 bg-white/10 px-7 font-medium text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:text-white hover:border-white/50"
                          >
                            <Link href="/rfq" className="inline-flex items-center gap-2">
                              <span>Request a Quotation</span>
                              <ArrowUpRight className="size-4 opacity-75" aria-hidden="true" />
                            </Link>
                          </Button>
                        </motion.div>

                        {/* Micro Trust Indicators */}
                        <motion.div
                          variants={reducedMotion ? undefined : ITEM_VARIANTS}
                          className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-medium text-white/75"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                            100% Genuine Imported Brands
                          </span>
                          <span className="hidden sm:inline text-white/30" aria-hidden="true">•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Award className="size-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                            ISO/IEC 17025 Traceable Lab
                          </span>
                          <span className="hidden sm:inline text-white/30" aria-hidden="true">•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Truck className="size-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                            Nationwide Fast Delivery
                          </span>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Arrow Controls */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xl transition-all duration-200 hover:scale-110 hover:bg-black/70 hover:border-white/40 sm:grid shadow-lg"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xl transition-all duration-200 hover:scale-110 hover:bg-black/70 hover:border-white/40 sm:grid shadow-lg"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      {/* High-Tech Numbered Segmented Progress Bar */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center items-center gap-2 sm:gap-3 px-4 z-20">
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur-xl shadow-xl">
          <span className="text-[11px] font-mono font-medium text-white/60 pl-1">
            0{selected + 1} <span className="text-white/30">/ 0{slides.length}</span>
          </span>

          <div className="h-3.5 w-px bg-white/20 mx-1" aria-hidden="true" />

          <div className="flex items-center gap-1.5">
            {slides.map((slide, index) => {
              const isCurrent = selected === index;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  aria-current={isCurrent}
                  className="group relative flex h-6 items-center px-1"
                >
                  <span
                    className={cn(
                      "relative h-1.5 rounded-full overflow-hidden transition-all duration-300",
                      isCurrent ? "w-10 sm:w-14 bg-white/30" : "w-4 sm:w-6 bg-white/20 group-hover:bg-white/40",
                    )}
                  >
                    {isCurrent && (
                      <motion.span
                        key={reducedMotion ? "static" : selected}
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        initial={{ width: reducedMotion ? "100%" : "0%" }}
                        animate={{ width: "100%" }}
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : { duration: AUTOPLAY_DELAY_MS / 1000, ease: "linear" }
                        }
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

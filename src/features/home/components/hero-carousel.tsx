"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Promotion } from "@/features/content/types";

const AUTOPLAY_DELAY_MS = 6000;

/** Staggered entrance for the text block — each line arrives a beat after the last, not all at once. */
const CONTENT_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
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
        stopOnMouseEnter: false,
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

  // Stop the autoplay plugin outright when motion is unwelcome.
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
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured"
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
                <div className="relative h-[480px] w-full sm:h-[560px] lg:h-[640px]">
                  <Image
                    src={slide.imageUrl}
                    alt=""
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover"
                  />

                  {/* Left-to-right for legible left-aligned copy, plus a soft
                      bottom fade so the progress bars always sit on a dark
                      surface regardless of what's in the photo there. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-r from-black/90 via-black/55 to-black/10"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/60 to-transparent"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full px-6 sm:px-10 lg:px-16">
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
                        className="max-w-4xl mx-auto text-center"
                      >
                        <motion.span
                          variants={reducedMotion ? undefined : ITEM_VARIANTS}
                          className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300 backdrop-blur-sm"
                        >
                          <ShieldCheck
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          {slide.eyebrow}
                        </motion.span>

                        <motion.h2
                          variants={reducedMotion ? undefined : ITEM_VARIANTS}
                          className="mt-4 text-3xl leading-[1.1] font-semibold text-balance text-white sm:text-4xl lg:text-5xl"
                        >
                          {slide.title}
                        </motion.h2>

                        {slide.subtitle && (
                          <motion.p
                            variants={reducedMotion ? undefined : ITEM_VARIANTS}
                            className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-white/80 sm:text-base"
                          >
                            {slide.subtitle}
                          </motion.p>
                        )}

                        <motion.div
                          variants={reducedMotion ? undefined : ITEM_VARIANTS}
                          className="mt-7 flex flex-wrap items-center justify-center gap-3"
                        >
                          <Button
                            asChild
                            size="lg"
                            className="group px-6 shadow-lg shadow-primary/25 rounded-full"
                          >
                            <Link href={slide.href}>
                              {slide.ctaLabel}
                              <ArrowUpRight
                                className="size-4 transition-transform duration-300 group-hover:rotate-45"
                                aria-hidden="true"
                              />
                            </Link>
                          </Button>

                          <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/30 bg-white/10 px-6 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white rounded-full"
                          >
                            <Link href="/rfq">Request a quotation</Link>
                          </Button>
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

      {/* Arrows — hidden on small screens where swiping is the natural gesture */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:grid"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:grid"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      <div className="absolute bottom-6 left-6 flex gap-2 sm:left-10 lg:left-16">
        {slides.map((slide, index) => (
          // The visible progress bar stays a thin 1.5px-tall pill — the button
          // itself is taller and centres it, so the tap target isn't the same
          // sliver of pixels a touchscreen would otherwise have to hit.
          <button
            key={slide.id}
            type="button"
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={selected === index}
            className="group relative flex h-6 w-8 items-center"
          >
            <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              {selected === index && (
                <motion.span
                  key={reducedMotion ? "static" : selected}
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  initial={{ width: reducedMotion ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: AUTOPLAY_DELAY_MS / 1000, ease: "linear" }
                  }
                />
              )}
              <span
                className={cn(
                  "absolute inset-0 rounded-full bg-white transition-opacity",
                  selected === index
                    ? "opacity-0"
                    : "opacity-0 group-hover:opacity-40",
                )}
              />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

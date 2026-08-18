"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Promotion } from "@/features/content/types";

/**
 * Hero carousel.
 *
 * Uses Embla directly rather than the shadcn `Carousel` wrapper because this
 * needs autoplay, dot indicators and slide-aware state — wrapping the wrapper
 * would cost more than it saves.
 *
 * Three things a rotating hero usually gets wrong, handled here:
 *
 *  - **Autoplay is disabled when the user asks for reduced motion.** A banner
 *    that moves on its own is the clearest case for honouring that setting.
 *  - **Autoplay stops on interaction and on hover**, so it never yanks a slide
 *    away from someone reading it.
 *  - **Only the first slide's image is `priority`.** Marking all three would
 *    make the browser fetch two large images nobody has seen yet and delay LCP.
 *
 * Every slide renders in the DOM regardless of JS, so the copy and links are
 * present for crawlers and if hydration never happens.
 */
export function HeroCarousel({ slides }: { slides: Promotion[] }) {
  const reducedMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true }),
  ]);

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

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
            >
              <div className="relative aspect-4/3 w-full sm:aspect-21/9 lg:aspect-[2.6/1]">
                <Image
                  src={slide.imageUrl}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="object-cover"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/10"
                />

                <div className="absolute inset-0 flex items-center">
                  <div className="w-full max-w-2xl px-6 py-8 sm:px-10 lg:px-14">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 sm:text-sm">
                      {slide.eyebrow}
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold leading-tight text-balance text-white sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h2>

                    {slide.subtitle && (
                      <p className="mt-4 max-w-lg text-sm text-white/80 sm:text-base">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild size="lg" className="group rounded-full">
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
                        className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                      >
                        <Link href="/rfq">Request a quote</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows — hidden on small screens where swiping is the natural gesture */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background sm:grid"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background sm:grid"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={selected === index}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              selected === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75",
            )}
          />
        ))}
      </div>
    </section>
  );
}

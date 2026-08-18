"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type {
  Testimonial as TestimonialType,
} from "@/features/content/types";

/**
 * Customer quotes — fixed image, rotating quote.
 *
 * The photograph never changes; only the text on the right does. That is the
 * point of the layout: one steady image anchors the band while the quotes
 * cycle, so nothing jumps and the eye stays where the words are.
 *
 * Rotation uses `setInterval` and a state swap rather than a carousel library.
 * Nothing slides — only the content is replaced — so a track, transforms and
 * an animation loop would all be machinery for an effect that is really just
 * "show a different quote".
 *
 * Autoplay pauses on hover and focus, stops permanently once a dot is clicked,
 * and never starts at all when the visitor has asked for reduced motion. Text
 * that replaces itself while being read is worse than no rotation.
 */
const INTERVAL_MS = 6000;

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

  // Choosing a quote ends autoplay for good. Rotating away from something the
  // visitor deliberately selected is the most irritating thing this component
  // could do.
  const goTo = useCallback((next: number) => {
    setIndex(next);
    setStopped(true);
  }, []);

  useEffect(() => {
    if (reducedMotion || paused || stopped || count <= 1) return;

    const id = setInterval(() => setIndex((current) => (current + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [reducedMotion, paused, stopped, count]);

  if (count === 0) return null;

  const active = testimonials[Math.min(index, count - 1)]!;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="overflow-hidden rounded-2xl border bg-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-4/3 md:aspect-auto md:min-h-[26rem]">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center gap-5 bg-muted/30 p-8 sm:p-10">
          <h2 id="testimonials-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            What our clients say
          </h2>

          <Quote className="size-8 shrink-0 text-primary/30" aria-hidden="true" />

          {/*
            aria-live so the change is announced to a screen reader rather than
            silently swapping underneath someone. `polite` waits for a pause.
          */}
          <figure aria-live="polite" aria-atomic="true" className="min-h-56">
            <p className="text-lg font-semibold text-balance">“{active.headline}”</p>

            <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {active.quote}
            </blockquote>

            <figcaption className="mt-6 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                {active.authorName
                  .split(/\s+/)
                  .map((part) => part[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>

              <span className="min-w-0">
                <span className="block truncate font-semibold">{active.authorName}</span>
                <span className="block truncate text-sm text-muted-foreground">
                  {active.authorRole}, {active.company}
                </span>
              </span>
            </figcaption>
          </figure>

          {count > 1 && (
            <div className="flex gap-2" role="tablist" aria-label="Choose a testimonial">
              {testimonials.map((testimonial, i) => (
                <button
                  key={testimonial.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Testimonial ${i + 1} of ${count}: ${testimonial.authorName}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "size-2.5 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

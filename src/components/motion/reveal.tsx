"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";

/**
 * Reveals its contents as it scrolls into view.
 *
 * GSAP ScrollTrigger rather than Framer Motion's `whileInView`, which this
 * codebase already has available. The two are not equivalent for this job:
 * `whileInView` is a binary in-or-out toggle driven by IntersectionObserver,
 * whereas ScrollTrigger exposes the scroll position itself — which is what
 * lets `stagger` walk a grid in reading order at a rate tied to the scroll,
 * and what keeps every reveal on the same ticker as the Lenis smooth-scroll
 * loop. Mixing observers with a lerped scroll position is how reveals end up
 * firing a beat early or late.
 *
 * Framer Motion stays where it is better: component-level interaction, layout
 * transitions and `AnimatePresence` — the nav pill, the hero, the floating
 * navbar. GSAP owns scroll orchestration; Framer owns interaction.
 *
 * Nothing is hidden by CSS. The from-state is set by `gsap.from` inside
 * `useGSAP`, which runs in a layout effect — before paint, so there is no
 * flash — and if the script never runs, the content simply renders visible
 * instead of being stranded at `opacity: 0` forever.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Reveal({
  children,
  className,
  /** Distance travelled, in px. Negative values enter from below. */
  y = 40,
  delay = 0,
  /** Stagger the element's own direct children instead of moving it as one block. */
  stagger = false,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      // `matchMedia` rather than a one-off check: it re-evaluates if the
      // preference changes mid-session and reverts what it created.
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger
          ? Array.from(element.children)
          : element;

        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.7,
          delay,
          ease: "power3.out",
          stagger: stagger ? 0.08 : 0,
          scrollTrigger: {
            trigger: element,
            // Fires once the top of the section is a little into the viewport,
            // so it is already moving by the time it is properly on screen.
            start: "top 85%",
            // Play once. Re-running on every pass makes a page feel unstable
            // when someone scrolls back up to re-read something.
            toggleActions: "play none none none",
          },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

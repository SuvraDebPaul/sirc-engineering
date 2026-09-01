"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Animated number that counts up to `value` once it scrolls into view.
 *
 * Tweens a plain object rather than the DOM text directly — GSAP interpolates
 * `counter.n` as a float every tick, and `onUpdate` rounds and formats it into
 * the span. Driving `textContent` through a real DOM ref instead of React
 * state means ~60 renders/second stay entirely inside GSAP's own scheduler,
 * not React's.
 *
 * `gsap.matchMedia` rather than a read-once check: it re-evaluates if the
 * visitor's `prefers-reduced-motion` setting changes mid-session, and the
 * reduced-motion branch jumps straight to the final value instead of
 * animating — counting numbers is exactly the kind of motion that setting
 * exists to suppress.
 *
 * The server-rendered markup shows the real, final number, not zero. GSAP
 * resets it to zero and counts back up inside `useGSAP`'s layout effect,
 * which runs before the browser paints — so a visitor with JavaScript never
 * sees a flash of the true figure before the count-up starts. A visitor
 * *without* it — or if the script errors — sees the correct number and
 * nothing more, rather than a counter frozen at zero forever.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

export function StatCounter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const format = (n: number) => Math.round(n).toLocaleString("en-US");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { n: 0 };
        el.textContent = "0";

        gsap.to(counter, {
          n: value,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = format(counter.n);
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.textContent = format(value);
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [value] },
  );

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-US")}
    </span>
  );
}

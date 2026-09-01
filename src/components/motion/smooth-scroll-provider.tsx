"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Smooth scrolling, wired into GSAP's ticker.
 *
 * Lenis rather than GSAP's own ScrollSmoother, despite ScrollSmoother now
 * being free. ScrollSmoother works by putting the whole page inside a
 * CSS-transformed wrapper, and a transformed ancestor becomes the containing
 * block for `position: fixed` descendants. This site has three that would
 * break: the floating navbar, the WhatsApp button, and every Radix dialog and
 * sheet overlay — all of which would start scrolling with the page instead of
 * pinning to the viewport.
 *
 * Lenis instead lerps the real scroll position, so `position: fixed` still
 * resolves against the viewport and `window.scrollY` stays truthful. That
 * second part matters as much as the first: the existing Framer Motion
 * `useScroll` in the floating navbar and the promo-banner parallax read
 * `scrollY` directly, and they keep working untouched.
 *
 * One rAF loop, not two. Lenis is driven from GSAP's ticker with `autoRaf`
 * off, so both libraries advance on the same frame — running Lenis's own loop
 * alongside GSAP's makes scroll position and animation drift a frame apart,
 * which reads as jitter on pinned or scrubbed elements.
 */
gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider() {
  useEffect(() => {
    // Smooth scrolling is motion the visitor did not ask for and cannot stop
    // mid-gesture, so honour the preference by simply never starting it.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Exponential ease-out: fast to start, long settle. Anything with a
      // pronounced tail feels laggy rather than smooth on a trackpad.
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      // Touch devices already scroll smoothly and momentum is OS-owned there;
      // overriding it fights the platform and feels wrong on a phone.
      syncTouch: false,
      autoRaf: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      // GSAP's ticker reports seconds, Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    // Lag smoothing pauses the ticker after a long frame, which strands Lenis
    // mid-lerp and shows up as the page freezing on tab refocus.
    gsap.ticker.lagSmoothing(0);

    // Images settle after first paint and move every trigger below them.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}

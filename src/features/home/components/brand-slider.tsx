import Image from "next/image";

import { Marquee } from "@/components/ui/marquee";
import type { Brand } from "@/features/catalog/types";

/**
 * Brand trust strip.
 *
 * Server component. The marquee itself is CSS-driven, so the only cost is the
 * logo images.
 *
 * Shows every brand rather than a fixed slice — the point of a credibility
 * strip is breadth, and a hardcoded cutoff would silently hide new brands as
 * they're added. Duration scales with the count instead of staying fixed, so
 * the strip keeps the same per-logo pace as it grows: six logos at the
 * original 20s felt right, so that ratio (~3.3s/logo) carries forward rather
 * than cramming more logos into an unchanged loop and making it race.
 */
const REFERENCE_LOGO_COUNT = 6;
const REFERENCE_DURATION_S = 20;
const SECONDS_PER_LOGO = REFERENCE_DURATION_S / REFERENCE_LOGO_COUNT;
const MIN_DURATION_S = 15;

export function BrandSlider({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  const duration = Math.max(MIN_DURATION_S, Math.round(brands.length * SECONDS_PER_LOGO));

  return (
    <section className="overflow-hidden py-6 md:py-10" aria-label="Brands we supply">
      <Marquee pauseOnHover className="p-0" style={{ "--duration": `${duration}s` } as React.CSSProperties}>
        {brands.map((brand) => (
          <div key={brand.id} className="mx-6 lg:mx-10">
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              width={200}
              height={100}
              className="h-8 w-36"
            />
          </div>
        ))}
      </Marquee>
    </section>
  );
}

export default BrandSlider;

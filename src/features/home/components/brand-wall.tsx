import Image from "next/image";
import Link from "next/link";

import { SectionCta } from "@/features/home/components/section-cta";
import { SectionHeading } from "@/features/home/components/section-heading";
import type { Brand } from "@/features/catalog/types";

/**
 * Brand logo wall.
 *
 * Static grid rather than the marquee used near the hero — this section is a
 * credibility list a buyer scans for the name they already standardise on, and
 * a moving target is hard to scan.
 *
 * Logos sit desaturated and lift to full colour on hover. A wall of twenty
 * competing brand palettes fights for attention and reads as clutter; muting
 * them lets the grid read as one texture until you point at a specific name.
 *
 * The desaturation is on the logo but keyed to the *card's* hover via `group`.
 * Keying it to the image itself only responds when the cursor is over the
 * logo's own box rather than anywhere on its tile, which is what the previous
 * version did.
 */
export function BrandWall({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section aria-labelledby="brands-heading">
      <SectionHeading
        id="brands-heading"
        title="Brands we supply"
        subtitle="Authorised supply, application support and in-house calibration for the manufacturers your engineers already trust."
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/brands/${brand.id}`}
              className="group flex h-24 cursor-pointer items-center justify-center rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transform-none"
              aria-label={brand.name}
            >
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={160}
                height={40}
                className="h-8 w-auto opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
              />
            </Link>
          </li>
        ))}
      </ul>

      <SectionCta href="/brands" label="All brands" />
    </section>
  );
}

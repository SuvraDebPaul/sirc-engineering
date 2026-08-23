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
 */
export function BrandWall({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section aria-labelledby="brands-heading">
      <SectionHeading
        id="brands-heading"
        align="start"
        title="Brands we supply"
        subtitle="Authorised supply, application support and in-house calibration for the manufacturers your engineers already trust."
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/brands/${brand.id}`}
              className="flex h-24 items-center justify-center rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
              aria-label={brand.name}
            >
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={160}
                height={40}
                className="h-8 w-auto opacity-70 transition-opacity hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>

      <SectionCta href="/brands" label="All brands" />
    </section>
  );
}

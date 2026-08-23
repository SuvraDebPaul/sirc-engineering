import Image from "next/image";

import { Marquee } from "@/components/ui/marquee";
import type { Brand } from "@/features/catalog/types";

/**
 * Brand trust strip.
 *
 * Server component. The marquee itself is CSS-driven, so the only cost is the
 * logo images.
 */
export function BrandSlider({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="overflow-hidden py-6 md:py-10" aria-label="Brands we supply">
      <Marquee pauseOnHover className="[--duration:20s] p-0">
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

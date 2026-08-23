"use client";

import { SectionCta } from "@/features/home/components/section-cta";
import { SectionHeading } from "@/features/home/components/section-heading";
import { ProductCard } from "@/features/catalog/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type {
  CustomerTier,
  Product,
} from "@/features/catalog/types";

/**
 * Special offers — full product cards, paged as a carousel.
 *
 * Same shape as every other carousel band: title left, arrows right on the
 * same row, and the "view all" at the bottom where it reads as the next step
 * rather than an invitation to skip the section.
 *
 * Eight cards to a slide (4×2), so a page fills the grid on desktop without
 * the second row being a lonely orphan.
 */
const PER_PAGE = 8;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

export function FeaturedProducts({
  products = [],
  tier = "GUEST",
  title = "Special offers",
  subtitle,
  ctaHref = "/products",
  /** Distinguishes the heading id when more than one of these lands on the same page. */
  headingId = "special-offers-heading",
}: {
  products?: Product[];
  tier?: CustomerTier;
  title?: string;
  subtitle?: string;
  ctaHref?: string;
  headingId?: string;
}) {
  if (products.length === 0) return null;

  const pages = chunk(products, PER_PAGE);
  const multiPage = pages.length > 1;

  return (
    <section aria-labelledby={headingId}>
      <Carousel opts={{ align: "start", loop: multiPage }} className="w-full">
        <SectionHeading
          id={headingId}
          align="start"
          title={title}
          subtitle={
            subtitle ??
            `${products.length} ${products.length === 1 ? "instrument" : "instruments"} with a live discount.`
          }
          actions={
            multiPage ? (
              <div className="hidden items-center gap-2 sm:flex">
                <CarouselPrevious className="static size-9 translate-y-0" />
                <CarouselNext className="static size-9 translate-y-0" />
              </div>
            ) : null
          }
        />

        <CarouselContent className="-ml-4">
          {pages.map((page, pageIndex) => (
            <CarouselItem key={pageIndex} className="pl-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {page.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    tier={tier}
                    // Only the first slide is above the fold; eagerly loading
                    // later pages would fetch images nobody has scrolled to.
                    priority={pageIndex === 0 && index < 4}
                  />
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <SectionCta href={ctaHref} />
    </section>
  );
}

export default FeaturedProducts;

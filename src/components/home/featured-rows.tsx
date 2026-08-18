"use client";

import { SectionCta } from "@/components/home/section-cta";
import { SectionHeading } from "@/components/home/section-heading";
import { ProductRow } from "@/components/product/product-row";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CustomerTier, Product } from "@/types";

/**
 * Featured products as compact rows, paged.
 *
 * Deliberately a different shape from the card grids above and below it —
 * three identical grids stacked down a page stop reading as separate sections
 * and get scrolled past.
 *
 * Six rows to a slide (3×2), matching the reference.
 */
const PER_PAGE = 6;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

export function FeaturedRows({
  products,
  tier = "GUEST",
  title = "Featured instruments",
  subtitle,
}: {
  products: Product[];
  tier?: CustomerTier;
  title?: string;
  subtitle?: string;
}) {
  if (products.length === 0) return null;

  const pages = chunk(products, PER_PAGE);
  const multiPage = pages.length > 1;

  return (
    <section aria-labelledby="featured-heading">
      <Carousel opts={{ align: "start", loop: multiPage }} className="w-full">
        <SectionHeading
          id="featured-heading"
          align="start"
          title={title}
          subtitle={subtitle}
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {page.map((product) => (
                  <ProductRow key={product.id} product={product} tier={tier} />
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

      </Carousel>

      <SectionCta href="/products" />
    </section>
  );
}

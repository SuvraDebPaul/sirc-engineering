"use client";

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
 * A titled strip of product cards — "You may also like", "Related products".
 *
 * Same pattern as every carousel band on the home page: title on the left,
 * arrows on the right of the same row. It slides one card at a time rather
 * than paging a grid, because these strips are a single row and paging would
 * jump five products at a time past something the visitor was looking at.
 */
export function ProductCarouselSection({
  id,
  title,
  products,
  tier = "GUEST",
}: {
  id: string;
  title: string;
  products: Product[];
  tier?: CustomerTier;
}) {
  if (products.length === 0) return null;

  const scrollable = products.length > 2;

  return (
    <section aria-labelledby={id}>
      <Carousel opts={{ align: "start", loop: false, slidesToScroll: 1 }} className="w-full">
        <SectionHeading
          id={id}
          align="start"
          title={title}
          actions={
            scrollable ? (
              <div className="hidden items-center gap-2 sm:flex">
                <CarouselPrevious className="static size-9 translate-y-0" />
                <CarouselNext className="static size-9 translate-y-0" />
              </div>
            ) : null
          }
        />

        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <ProductCard product={product} tier={tier} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

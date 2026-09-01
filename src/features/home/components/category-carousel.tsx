"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/features/home/components/section-heading";
import { Icon } from "@/components/shared/icon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Category } from "@/features/catalog/types";

/**
 * "Shop by category" carousel.
 *
 * Paged rather than free-scrolling: each slide is a full 7×2 block of tiles and
 * the arrows move a whole page. Every category stays reachable — the previous
 * static grid silently cut the list off at 14 of 24.
 *
 * The arrows sit in the heading row rather than floating over the tiles.
 * Overlaying them covers the first and last tile in a row, and on a grid of
 * small targets that is exactly where the cursor wants to go.
 *
 * Tiles use line-art icons, not photographs. At this size a photo reduces to a
 * muddy colour blob; a monochrome outline stays legible and gives the row a
 * consistent rhythm that 24 unrelated photos never would. Fixed to a square
 * aspect ratio so the grid reads as one deliberate mosaic rather than tiles of
 * whatever height their label happened to wrap to.
 */
const PER_PAGE = 14;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    pages.push(items.slice(i, i + size));
  return pages;
}

export function CategoryCarousel({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  const pages = chunk(categories, PER_PAGE);
  const multiPage = pages.length > 1;

  return (
    <section aria-labelledby="categories-heading">
      <Carousel opts={{ align: "start", loop: multiPage }} className="w-full">
        <SectionHeading
          id="categories-heading"
          align="start"
          title="Shop by category"
          subtitle="Instruments, tools and consumables across every discipline we support."
          actions={
            // `static translate-y-0` undoes the absolute centring the shadcn
            // buttons ship with, so they sit in the flow of the heading row.
            multiPage ? (
              <div className="hidden items-center gap-2 sm:flex">
                <CarouselPrevious className="static size-10 translate-y-0 border-border/80 hover:border-primary hover:bg-primary hover:text-primary-foreground" />
                <CarouselNext className="static size-10 translate-y-0 border-border/80 hover:border-primary hover:bg-primary hover:text-primary-foreground" />
              </div>
            ) : null
          }
        />

        <CarouselContent className="-ml-3">
          {pages.map((page, pageIndex) => (
            <CarouselItem key={pageIndex} className="pl-3">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {page.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {/* Soft glow behind the icon on hover, not a flat colour
                          swap — reads as premium rather than just "a state
                          changed". Clipped by the card's own overflow-hidden. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 scale-90 rounded-full bg-primary/10 opacity-0 blur-2xl transition-all duration-300 group-hover:scale-150 group-hover:opacity-100"
                      />

                      <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-muted transition-colors duration-300 group-hover:bg-primary md:size-16">
                        <Icon
                          name={category.icon}
                          className="size-7 text-foreground/70 transition-colors duration-300 group-hover:text-primary-foreground md:size-8"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </span>

                      <span className="relative line-clamp-2 text-xs font-medium text-balance text-foreground/90 leading-snug transition-colors duration-300 group-hover:text-primary sm:text-sm">
                        {category.name}
                      </span>

                      <ArrowRight
                        aria-hidden="true"
                        className="absolute top-3 right-3 size-3.5 -translate-x-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {multiPage && (
        <p className="mt-4 text-center text-xs text-muted-foreground sm:hidden">
          Swipe for more categories
        </p>
      )}
    </section>
  );
}

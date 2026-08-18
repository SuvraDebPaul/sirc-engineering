"use client";

import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { Icon } from "@/components/shared/icon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Category } from "@/types";

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
 * consistent rhythm that 24 unrelated photos never would.
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
                <CarouselPrevious className="static size-9 translate-y-0" />
                <CarouselNext className="static size-9 translate-y-0" />
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
                      className="group flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-muted/50 p-5 text-center transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <Icon
                        name={category.icon}
                        className="size-12 text-foreground/80 transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none md:size-14"
                        strokeWidth={1}
                        aria-hidden="true"
                      />

                      <span className="line-clamp-2 text-xs font-medium leading-snug text-balance group-hover:text-primary sm:text-sm">
                        {category.name}
                      </span>
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

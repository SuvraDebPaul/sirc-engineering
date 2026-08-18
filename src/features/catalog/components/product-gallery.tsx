"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { ProductImage } from "@/features/catalog/types";

/**
 * Product gallery — thumbnail strip beside a main image.
 *
 * The thumbnails are real buttons in a tablist, so the whole gallery works
 * from the keyboard and announces which frame is showing. Only the selected
 * image is drawn at full size; the rest stay at thumbnail resolution until
 * chosen, which keeps the page weight down on a component that is otherwise
 * the heaviest thing above the fold.
 *
 * The strip sits to the left on desktop and below the image on mobile, where
 * a vertical rail would eat half the width of the screen.
 *
 * Each frame carries a caption rather than a generic alt. Only the first is
 * the instrument itself — the others show the laboratory it is certified in,
 * and saying so is better than implying they are alternate product views.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-square rounded-2xl border bg-muted/40" aria-hidden="true" />;
  }

  const active = images[Math.min(index, images.length - 1)]!;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div
          role="tablist"
          aria-label={`${productName} images`}
          aria-orientation="vertical"
          className="flex gap-3 overflow-x-auto sm:max-h-[30rem] sm:flex-col sm:overflow-y-auto sm:overflow-x-visible"
        >
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={image.caption}
              onClick={() => setIndex(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted/40 transition-all sm:size-20",
                i === index
                  ? "border-primary ring-2 ring-primary/30"
                  : "hover:border-primary/50 opacity-70 hover:opacity-100",
              )}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <figure className="min-w-0 flex-1">
        <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted/30">
          <Image
            src={active.url}
            alt={active.caption}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>

        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {active.caption}
        </figcaption>
      </figure>
    </div>
  );
}

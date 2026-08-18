import Image from "next/image";
import { Check } from "lucide-react";

import type { ProductDetail } from "@/types";

/**
 * The description panel: narrative, a banner, then what we supply with it.
 *
 * The specification table lives in the "Additional information" tab rather
 * than being repeated at the foot of this one. The reference design stacks
 * both into a single scroll, which leaves the second tab with nothing to say —
 * splitting them gives each tab a reason to exist.
 */
export function ProductDescription({ detail }: { detail: ProductDetail }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold tracking-tight">About this item</h2>

        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {detail.overview.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {detail.highlights.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {detail.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Banner. The gradient runs the full width rather than only under the
          text, so the heading stays legible wherever the photo is light. */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative aspect-21/9 min-h-56">
          <Image
            src="/images/catalog/svc-calibration.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"
          />
        </div>

        <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6 text-white sm:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Supplied and supported</p>
          <p className="text-2xl font-bold leading-tight sm:text-4xl">
            Calibrated before
            <br />
            it reaches you
          </p>
          <p className="max-w-sm text-sm text-white/80">
            Certified in our own laboratory, with traceability back to national standards.
          </p>
        </div>
      </div>

      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {detail.sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide">{section.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

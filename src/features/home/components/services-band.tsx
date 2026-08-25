import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";

import { SectionCta } from "@/features/home/components/section-cta";
import { SectionHeading } from "@/features/home/components/section-heading";
import { Icon } from "@/components/shared/icon";
import type { ServiceHighlight } from "@/features/content/types";

/**
 * Laboratory services — a call-to-action card per service.
 *
 * The count is whatever `getServices()` returns, so the grid steps 1 → 2 → 3
 * columns rather than assuming a single full row. A trailing part-row is
 * expected and fine; hard-coding three would silently hide services as the
 * laboratory adds them.
 *
 * This band has no equivalent in the reference design, which sells tools only.
 * It is the most important addition on the page: the calibration laboratory is
 * what separates this business from every other tool distributor, and it is
 * recurring revenue rather than a one-off sale.
 *
 * Each card leads with a photograph. The icon badge sits over the image rather
 * than being dropped — it survives as the visual key that ties the card to the
 * same service elsewhere on the site, and it still reads if an image fails to
 * load.
 *
 * Turnaround and on-site availability are the two questions every enquiry
 * opens with, so they get chips in a fixed position on every card rather than
 * a sentence in the description where their placement drifts with the copy.
 */
export function ServicesBand({ services }: { services: ServiceHighlight[] }) {
  if (services.length === 0) return null;

  return (
    <section
      aria-labelledby="services-heading"
      className="rounded-3xl border border-border/60 bg-linear-to-b from-muted/50 to-muted/20 p-6 sm:p-10"
    >
      <SectionHeading
        id="services-heading"
        title="Laboratory services"
        subtitle="Calibration, testing and inspection with as-found and as-left values, stated uncertainty and an unbroken traceability chain."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={service.href}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transform-none"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-muted">
              <Image
                src={service.imageUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
              />

              {/* Bottom-weighted scrim so the icon badge stays legible over
                  whatever happens to be in that corner of the photograph. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"
              />

              <span className="absolute bottom-3 left-3 grid size-11 place-items-center rounded-full bg-background/95 text-primary shadow-sm backdrop-blur-sm transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon name={service.icon} className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-base leading-snug font-semibold transition-colors duration-200 group-hover:text-primary">
                {service.title}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              <ul className="mt-4 flex flex-wrap gap-2">
                <li className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  {service.turnaroundDays}-day turnaround
                </li>
                {service.onSite && (
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    On-site available
                  </li>
                )}
              </ul>

              {/* Hairline above the action so it reads as the card's footer
                  rather than another line of body copy. */}
              <span className="mt-5 inline-flex items-center justify-between gap-1.5 border-t border-border/60 pt-4 text-sm font-medium text-primary">
                Learn more
                <ArrowUpRight
                  className="size-4 transition-transform duration-300 group-hover:rotate-45 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <SectionCta href="/services" label="All services" />
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";

import { SectionCta } from "@/features/home/components/section-cta";
import { SectionHeading } from "@/features/home/components/section-heading";
import { Icon } from "@/components/shared/icon";
import type { ServiceHighlight } from "@/features/content/types";

/**
 * Laboratory services — the three call-to-action cards.
 *
 * This band has no equivalent in the reference design, which sells tools only.
 * It is the most important addition on the page: the calibration laboratory is
 * what separates this business from every other tool distributor, and it is
 * recurring revenue rather than a one-off sale.
 *
 * Each card now leads with a photograph. The icon badge sits over the image
 * rather than being dropped — it survives as the visual key that ties the card
 * to the same service elsewhere on the site, and it still reads if an image
 * fails to load.
 */
export function ServicesBand({ services }: { services: ServiceHighlight[] }) {
  if (services.length === 0) return null;

  return (
    <section aria-labelledby="services-heading" className="rounded-2xl bg-muted/40 p-6 sm:p-10">
      <SectionHeading
        id="services-heading"
        align="start"
        title="Laboratory services"
        subtitle="Calibration, testing and inspection with as-found and as-left values, stated uncertainty and an unbroken traceability chain."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={service.href}
            className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg motion-reduce:transform-none"
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
                className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent"
              />

              <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full bg-background/95 text-primary shadow-sm backdrop-blur-sm">
                <Icon name={service.icon} className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-semibold group-hover:text-primary">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{service.description}</p>

              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {service.turnaroundDays}-day turnaround
                </li>
                {service.onSite && (
                  <li className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    On-site available
                  </li>
                )}
              </ul>

              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Learn more
                <ArrowRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
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

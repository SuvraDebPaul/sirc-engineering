import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { CtaPanel } from "@/components/shared/cta-panel";
import { Icon } from "@/components/shared/icon";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getServices } from "@/features/content/services/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Calibration, testing, inspection and instrument fleet management — carried out in our own laboratory or on your site, with traceable certificates.",
};

/**
 * Services index.
 *
 * The home page has been selling these bands since the first build and every
 * card dead-ended at a 404. This is the page they were pointing at.
 */
export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        title="Laboratory services"
        description="Calibration, testing and inspection with as-found and as-left values, stated uncertainty and an unbroken traceability chain."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <Container className="pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg motion-reduce:transform-none"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-muted">
                <Image
                  src={service.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent"
                />

                <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full bg-background/95 text-primary shadow-sm backdrop-blur-sm">
                  <Icon name={service.icon} className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-semibold group-hover:text-primary">{service.title}</h2>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

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

        <CtaPanel
          className="mt-14"
          title="Not sure which you need?"
          description="Describe the plant, the instruments and the deadline. An engineer will tell you what the job actually requires — including when it is less than you asked for."
          actions={
            <Button asChild size="lg">
              <Link href="/rfq?type=calibration">Request a quotation</Link>
            </Button>
          }
        />
      </Container>
    </>
  );
}

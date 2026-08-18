import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { CtaPanel } from "@/components/shared/cta-panel";
import { Icon } from "@/components/shared/icon";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { getIndustries } from "@/lib/api";

export const metadata: Metadata = {
  title: "Industries we serve",
  description:
    "Textiles and RMG, pharmaceutical, power, oil and gas, construction and food — measurement, calibration and inspection for each sector's own compliance requirements.",
};

/**
 * Industries index.
 *
 * B2B buyers identify by sector before they identify by product, so these are
 * the pages that catch "calibration for pharmaceutical audit" long before
 * anyone searches for a model number. They were referenced in the footer and
 * config for weeks without existing.
 */
export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <>
      <PageHeader
        title="Industries we serve"
        description="Every sector answers to a different auditor. These are the measurements each one has to defend, and what we supply to make that straightforward."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Industries" }]}
      />

      <Container className="pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg motion-reduce:transform-none"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-muted">
                <Image
                  src={industry.imageUrl}
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
                  <Icon name={industry.icon} className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-semibold group-hover:text-primary">{industry.name}</h2>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {industry.summary}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  What this sector needs
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
          title="Not listed here?"
          description="These are the sectors we work in most, not the only ones. Tell us what you measure and which standard you answer to, and we will tell you what the job needs."
          actions={
            <>
              <Button asChild size="lg">
                <Link href="/rfq">Request a quotation</Link>
              </Button>

              <WhatsAppButton
                label="Ask on WhatsApp"
                message="Hello, I would like to discuss measurement and calibration for our plant."
              />
            </>
          }
        />
      </Container>
    </>
  );
}

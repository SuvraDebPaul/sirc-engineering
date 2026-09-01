import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Icon } from "@/components/shared/icon";
import { PageHeader } from "@/components/shared/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  getServiceDetail,
  getServices,
} from "@/features/content/services/content";
import { ENQUIRY_TYPES } from "@/features/enquiries/services/rfq";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getServiceDetail(slug);

  if (!result) return { title: "Service not found" };

  return {
    title: result.service.title,
    description: result.service.description,
  };
}

/**
 * Service detail.
 *
 * Prerendered — nothing on the page varies by request. The FAQ uses the
 * existing accordion, which is the one interactive element; everything else is
 * static server-rendered markup.
 */
export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const result = await getServiceDetail(slug);

  if (!result) notFound();

  const { service, detail } = result;
  const others = (await getServices()).filter((entry) => entry.id !== service.id);

  // Service ids and RFQ enquiry types overlap for calibration, testing and
  // inspection but not for the rest. Anything unrecognised goes to "other"
  // rather than falling through to the form default, which is "purchase" —
  // a thermographic survey enquiry pre-set to "buy an instrument" is wrong.
  const enquiryType = ENQUIRY_TYPES.some((entry) => entry.value === service.id)
    ? service.id
    : "other";

  return (
    <>
      <PageHeader
        title={service.title}
        description={service.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />

      <Container className="pb-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <div className="min-w-0 space-y-12">
            <div className="relative aspect-21/9 overflow-hidden rounded-2xl bg-muted">
              <Image
                src={service.imageUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
            </div>

            <section>
              <h2 className="text-lg font-semibold tracking-tight">What this covers</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {detail.overview.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight">How it works</h2>

              <ol className="mt-5 space-y-5">
                {detail.process.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                    >
                      {index + 1}
                    </span>

                    <span className="min-w-0">
                      <span className="block font-medium">{step.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight">What you receive</h2>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {detail.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight">Common questions</h2>

              <Accordion type="single" collapsible className="mt-4">
                {detail.faqs.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger className="text-left text-sm font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                At a glance
              </h2>

              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {service.turnaroundDays} working {service.turnaroundDays === 1 ? "day" : "days"}{" "}
                    typical turnaround
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {service.onSite ? "On-site or in our laboratory" : "Carried out in our laboratory"}
                  </span>
                </li>
              </ul>

              <ul className="mt-5 space-y-2 border-t pt-5 text-sm">
                {detail.scope.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="mt-6 w-full" size="lg">
                <Link href={`/rfq?type=${enquiryType}`}>Request a quotation</Link>
              </Button>
            </section>

            {others.length > 0 && (
              <section className="rounded-2xl border border-border/60 bg-muted/40 p-6">
                <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Other services
                </h2>

                <ul className="mt-4 space-y-1">
                  {others.map((entry) => (
                    <li key={entry.id}>
                      <Link
                        href={`/services/${entry.id}`}
                        className="flex items-center gap-2.5 rounded-lg p-2 text-sm transition-colors duration-200 hover:bg-background"
                      >
                        <Icon
                          name={entry.icon}
                          className="size-4 shrink-0 text-primary"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate">{entry.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}

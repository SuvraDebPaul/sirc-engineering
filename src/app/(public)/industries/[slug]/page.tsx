import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ProductCarouselSection } from "@/features/catalog/components/product-carousel-section";
import { Icon } from "@/components/shared/icon";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import {
  getIndustries,
  getIndustryBySlug,
  getIndustryProducts,
  getIndustryServices,
} from "@/features/content/services/content";

export async function generateStaticParams() {
  const industries = await getIndustries();
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);

  if (!industry) return { title: "Industry not found" };

  return {
    title: `${industry.name} — instruments, calibration and inspection`,
    description: industry.summary,
  };
}

/**
 * Industry detail.
 *
 * Copy, then the measurements that sector has to defend, then real products
 * and real services underneath. The order matters: a buyer arriving from
 * search needs to recognise their own problem before they will look at stock.
 */
export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);

  if (!industry) notFound();

  const [products, services] = await Promise.all([
    getIndustryProducts(industry),
    getIndustryServices(industry),
  ]);

  return (
    <>
      <PageHeader
        title={industry.name}
        description={industry.summary}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Industries", href: "/industries" },
          { label: industry.name },
        ]}
      />

      <Container className="pb-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <div className="min-w-0 space-y-12">
            <div className="relative aspect-21/9 overflow-hidden rounded-2xl bg-muted">
              <Image
                src={industry.imageUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
            </div>

            <section>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                {industry.intro.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight">
                What this sector has to measure
              </h2>

              <div className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {industry.needs.map((need) => (
                  <div key={need.title}>
                    <h3 className="flex items-start gap-2 text-sm font-semibold">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                      {need.title}
                    </h3>
                    <p className="mt-1.5 pl-6 text-sm leading-relaxed text-muted-foreground">
                      {need.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {services.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold tracking-tight">Services this sector uses</h2>

                <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                  {services.map((service) => (
                    <li key={service.id}>
                      <Link
                        href={`/services/${service.id}`}
                        className="group flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/40"
                      >
                        <Icon
                          name={service.icon}
                          className="size-6 text-primary"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <h3 className="mt-3 text-sm font-semibold group-hover:text-primary">
                          {service.title}
                        </h3>
                        <p className="mt-1 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                          {service.description}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                          Learn more
                          <ArrowRight className="size-3" aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="text-sm font-semibold tracking-tight">Talk to an engineer</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Tell us the plant, the standard you answer to and the deadline. We will tell you
                what the job actually requires.
              </p>

              <Button asChild className="mt-5 w-full" size="lg">
                <Link href={`/rfq?type=calibration`}>Request a quotation</Link>
              </Button>

              <WhatsAppButton
                className="mt-3 w-full"
                label="Ask on WhatsApp"
                message={`Hello, I work in ${industry.name} and would like to discuss measurement and calibration.`}
              />
            </section>

            <section className="rounded-2xl border bg-muted/30 p-6">
              <h2 className="text-sm font-semibold tracking-tight">Other industries</h2>

              <ul className="mt-4 space-y-1">
                {(await getIndustries())
                  .filter((entry) => entry.slug !== industry.slug)
                  .map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        href={`/industries/${entry.slug}`}
                        className="flex items-center gap-2.5 rounded-md p-2 text-sm transition-colors hover:bg-background"
                      >
                        <Icon
                          name={entry.icon}
                          className="size-4 shrink-0 text-primary"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate">{entry.name}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          </aside>
        </div>

        {products.length > 0 && (
          <div className="mt-16">
            <ProductCarouselSection
              id="industry-products"
              title={`Instruments for ${industry.name.toLowerCase()}`}
              products={products}
            />
          </div>
        )}
      </Container>
    </>
  );
}

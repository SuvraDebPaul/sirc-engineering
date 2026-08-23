import type { Metadata } from "next";
import Link from "next/link";
import { FileText, MessageSquare, Truck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { CatalogBrowser } from "@/features/catalog/components/catalog-browser";
import { Button } from "@/components/ui/button";
import { getQuoteOnlyProducts } from "@/features/catalog/services";

export const metadata: Metadata = {
  title: "Corporate supply",
  description:
    "Quotation-based procurement for laboratories, plants and institutions — bulk pricing, purchase orders and agreed payment terms.",
};

const STEPS = [
  {
    icon: MessageSquare,
    title: "Tell us what you need",
    body: "Pick an instrument below or send us a specification — quantity, standard and delivery date.",
  },
  {
    icon: FileText,
    title: "We quote in writing",
    body: "A written quotation with unit price, lead time and payment terms — usually within one working day.",
  },
  {
    icon: Truck,
    title: "Order and delivery",
    body: "Purchase orders from registered businesses and institutions are accepted against the quotation.",
  },
];

/**
 * Corporate/institutional catalogue — every quote-only product, given its
 * own front door instead of sitting mixed into the general `/products`
 * listing. Same `isQuoteOnly` flag an admin already sets per product; a
 * buyer sourcing for a lab or plant now has one place to browse it.
 */
export default async function CorporatePage({ searchParams }: PageProps<"/corporate">) {
  const [params, products] = await Promise.all([searchParams, getQuoteOnlyProducts()]);

  return (
    <>
      <PageHeader
        title="Corporate supply"
        description="Quotation-based procurement for laboratories, plants and institutions — bulk pricing, purchase orders and agreed payment terms."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Corporate" }]}
      />

      <Container className="pb-20">
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border p-5">
              <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-muted/30 p-6">
          <div>
            <p className="font-semibold">Sourcing something not listed here?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We supply far more than we list online — send us the specification.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/rfq?type=purchase">Request a quotation</Link>
          </Button>
        </div>

        <CatalogBrowser
          products={products}
          params={params}
          basePath="/corporate"
          emptyHeading="No corporate-catalogue items listed yet"
          emptyMessage="We are still building this section out. Send us your specification and an engineer will quote against it directly."
        />
      </Container>
    </>
  );
}

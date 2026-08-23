import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { CtaPanel } from "@/components/shared/cta-panel";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  getBrandCounts,
  getBrands,
} from "@/features/catalog/services";

export const metadata: Metadata = {
  title: "Brands",
  description:
    "Fluke, Megger, Testo, Hioki, Yokogawa and more — supplied through authorised channels, with calibration and local support.",
};

/**
 * Brand index.
 *
 * Brands with stock are listed first and carry a count; the rest are ranges we
 * supply to order and are marked as such, rather than being presented as
 * shelves that turn out to be empty.
 */
export default async function BrandsPage() {
  const [brands, counts] = await Promise.all([getBrands(), getBrandCounts()]);

  const sorted = [...brands].sort(
    (a, b) => (counts[b.name] ?? 0) - (counts[a.name] ?? 0) || a.name.localeCompare(b.name),
  );

  return (
    <>
      <PageHeader
        title="Brands we supply"
        description="Instruments sourced through authorised channels, calibrated in our own laboratory and supported locally."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Brands" }]}
      />

      <Container className="pb-20">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((brand) => {
            const count = counts[brand.name] ?? 0;

            return (
              <li key={brand.id}>
                <Link
                  href={`/brands/${brand.id}`}
                  className="group flex h-full flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transform-none"
                >
                  <div className="relative h-10 w-full">
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      fill
                      sizes="180px"
                      className="object-contain transition-opacity group-hover:opacity-80"
                    />
                  </div>

                  <div className="mt-auto">
                    <p className="font-medium group-hover:text-primary">{brand.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {count > 0
                        ? `${count} ${count === 1 ? "product" : "products"}`
                        : "Supplied to order"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <CtaPanel
          className="mt-14"
          title="Looking for a brand not listed?"
          description="We source well beyond what we list. Send the make and model and we will come back with availability, lead time and a price."
          actions={
            <Button asChild size="lg">
              <Link href="/rfq">Request a quotation</Link>
            </Button>
          }
        />
      </Container>
    </>
  );
}

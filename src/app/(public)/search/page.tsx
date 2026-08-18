import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { Container } from "@/components/layout/container";
import { CatalogBrowser } from "@/features/catalog/components/catalog-browser";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getProducts } from "@/features/catalog/services";
import { getSiteSettings } from "@/features/settings/services/settings";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the catalogue by instrument, brand or model number.",
  // Search result pages are thin, infinite and duplicate the catalogue.
  robots: { index: false, follow: true },
};

/**
 * Catalogue search.
 *
 * The matching engine already existed — `parseCatalogQuery` reads `q` and
 * `filterProducts` matches on name, brand, model number and category — it just
 * had no page of its own once the header search was removed. This gives it
 * one, with the full filter sidebar, so a search can be narrowed rather than
 * only re-typed.
 *
 * A no-result search is a sales lead, not a dead end: someone who searched for
 * a specific model and found nothing is telling us exactly what to quote them.
 * That is why the empty state offers WhatsApp and the RFQ form rather than
 * just apologising.
 */
const POPULAR = ["Fluke", "Megger", "insulation", "thermal", "calibrator", "clamp meter"];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()]);

  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw ?? "").trim();

  // The browser filters on `q` itself, so the page hands it the whole
  // catalogue and lets one implementation do the matching.
  const hasQuery = query !== "";

  return (
    <>
      <PageHeader
        title="Search"
        description="By instrument, brand or model number."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <Container className="pb-20">
        <form action="/search" role="search" className="mx-auto mb-10 max-w-2xl">
          <div className="flex h-12 items-center rounded-lg border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <label htmlFor="search-q" className="sr-only">
              Search products
            </label>

            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={query}
              autoFocus={!hasQuery}
              placeholder="e.g. MIT525, Fluke, insulation tester…"
              className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
            />

            <button
              type="submit"
              className="flex h-full shrink-0 items-center gap-2 rounded-r-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="size-4" aria-hidden="true" />
              Search
            </button>
          </div>

          {!hasQuery && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Try:</span>
              {POPULAR.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {term}
                </Link>
              ))}
            </div>
          )}
        </form>

        {hasQuery ? (
          <CatalogBrowser
            products={products}
            params={params}
            basePath="/search"
            emptyHeading={`No results for “${query}”`}
            emptyMessage={`Nothing in the catalogue matches “${query}”. We supply far more than we list — send us the model and we will source it.`}
          />
        ) : (
          <div className="rounded-2xl border border-dashed py-16 text-center">
            <p className="font-medium">What are you looking for?</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Search by model number if you know it — that is the fastest way to find an exact
              instrument. Otherwise browse{" "}
              <Link href="/products" className="font-medium text-primary hover:underline">
                the full catalogue
              </Link>
              .
            </p>

            <div className="mt-6 flex justify-center">
              <WhatsAppButton
                whatsapp={settings.whatsapp}
                message="Hello, I am looking for an instrument and would like some help."
                label="Ask us on WhatsApp"
              />
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

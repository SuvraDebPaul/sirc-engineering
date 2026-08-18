import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { CatalogBrowser } from "@/components/product/catalog-browser";
import { PageHeader } from "@/components/shared/page-header";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Industrial measurement and test instruments from Fluke, Megger, Testo, Hioki and more — with calibration, testing and inspection from our own laboratory.",
};

/**
 * The catalogue listing.
 *
 * Filtering, sorting and paging all live in the query string, so this page is
 * a pure function of the URL: the same address always renders the same list,
 * for anyone it is sent to.
 *
 * The listing itself lives in `CatalogBrowser`, shared with the category
 * pages, so the two can never drift apart.
 */
export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const params = await searchParams;
  const products = await getProducts();

  return (
    <>
      <PageHeader
        title="Products"
        description="Measurement, test and inspection instruments — supplied, calibrated and supported in Bangladesh."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}
      />

      <Container className="pb-20">
        <CatalogBrowser products={products} params={params} basePath="/products" />
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { CatalogBrowser } from "@/components/product/catalog-browser";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getBrandById, getBrands, getProductsByBrand } from "@/lib/api";

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({ slug: brand.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandById(slug);

  if (!brand) return { title: "Brand not found" };

  return {
    title: brand.name,
    description: `${brand.name} instruments supplied, calibrated and supported by SIRC in Bangladesh.`,
  };
}

/**
 * Brand detail — the same catalogue browser scoped to one manufacturer.
 *
 * The brand facet stays in the sidebar rather than being hidden the way the
 * category facet is on a category page. It reads as a confirmation of what is
 * being shown, and with a single option there is nothing misleading about it.
 */
export default async function BrandPage({ params, searchParams }: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  const brand = await getBrandById(slug);

  if (!brand) notFound();

  const [search, products] = await Promise.all([searchParams, getProductsByBrand(brand)]);

  return (
    <>
      <PageHeader
        title={brand.name}
        description={
          products.length > 0
            ? `${products.length} ${products.length === 1 ? "instrument" : "instruments"} from ${brand.name}, supplied with a traceable calibration certificate.`
            : `We supply ${brand.name} to order — tell us the model you need.`
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Brands", href: "/brands" },
          { label: brand.name },
        ]}
      />

      <Container className="pb-20">
        <div className="mb-10 flex items-center justify-center">
          <div className="relative h-12 w-48">
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              fill
              sizes="192px"
              className="object-contain dark:hidden"
            />
            <Image
              src={brand.logoDarkUrl}
              alt=""
              fill
              sizes="192px"
              className="hidden object-contain dark:block"
            />
          </div>
        </div>

        {products.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed p-8 text-center sm:p-12">
            <h2 className="text-lg font-semibold">Nothing from {brand.name} listed yet</h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              We supply this range to order. Send the model number and we will confirm availability,
              lead time and price.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/rfq">Request a quotation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/brands">All brands</Link>
              </Button>
            </div>
          </div>
        ) : (
          <CatalogBrowser
            products={products}
            params={search}
            basePath={`/brands/${brand.id}`}
          />
        )}
      </Container>
    </>
  );
}

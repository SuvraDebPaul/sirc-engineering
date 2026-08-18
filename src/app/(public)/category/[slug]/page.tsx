import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { CatalogBrowser } from "@/components/product/catalog-browser";
import { Icon } from "@/components/shared/icon";
import { PageHeader } from "@/components/shared/page-header";
import { getCategories, getCategoryBySlug, getCategoryCounts, getProductsByCategory } from "@/lib/api";

/**
 * Category listing.
 *
 * The same browser as `/products`, scoped to one category and keeping its own
 * URL — every facet link, sort change and "load more" stays under
 * `/category/<slug>` rather than bouncing the visitor back to the full
 * catalogue. The category facet itself is dropped, since the route already
 * fixes it.
 *
 * Sixteen of the twenty-four categories currently hold no stock. They are kept
 * rather than pruned: they are the ranges the business intends to sell, they
 * are already linked from the home page, and a category page with nothing in
 * it is not a dead end here — it offers to source the instrument. Deleting
 * them would shrink the home page's category carousel to eight tiles and lose
 * the SEO surface for terms the business wants to rank on.
 */
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Category not found" };

  return {
    title: category.name,
    description: `${category.name} — instruments supplied, calibrated and supported by SIRC in Bangladesh.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const [search, products, counts] = await Promise.all([
    searchParams,
    getProductsByCategory(category),
    getCategoryCounts(),
  ]);

  const stocked = (await getCategories()).filter((entry) => (counts[entry.name] ?? 0) > 0);

  return (
    <>
      <PageHeader
        title={category.name}
        description={
          products.length > 0
            ? `${products.length} ${products.length === 1 ? "instrument" : "instruments"} in this category, in stock or made to order.`
            : "We do not list this range online yet — but we can still source and quote it."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: category.name },
        ]}
      />

      <Container className="pb-20">
        {products.length === 0 ? (
          <EmptyCategory categoryName={category.name} stocked={stocked} />
        ) : (
          <CatalogBrowser
            products={products}
            params={search}
            basePath={`/category/${category.slug}`}
            hideCategoryFacet
          />
        )}
      </Container>
    </>
  );
}

/**
 * A category we intend to sell but have not listed yet.
 *
 * Deliberately not a 404 and not an apology. Someone who reached this page has
 * told us exactly what they are shopping for, so the page asks them for the
 * specification and points at the categories that do have stock.
 */
async function EmptyCategory({
  categoryName,
  stocked,
}: {
  categoryName: string;
  stocked: Awaited<ReturnType<typeof getCategories>>;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-dashed p-8 text-center sm:p-12">
        <h2 className="text-lg font-semibold">Nothing listed under {categoryName} yet</h2>

        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          We supply far more than we list. Tell us the make, model or specification you need and an
          engineer will source it and come back with a written quotation.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/rfq?type=purchase&sku=${encodeURIComponent(categoryName)}`}
            className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Request a quotation
          </Link>

          <Link
            href="/products"
            className="inline-flex h-11 items-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Browse all products
          </Link>
        </div>
      </div>

      {stocked.length > 0 && (
        <section className="mt-12" aria-labelledby="stocked-categories">
          <h2 id="stocked-categories" className="text-sm font-semibold tracking-tight">
            Categories with stock right now
          </h2>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stocked.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/category/${entry.slug}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  <Icon
                    name={entry.icon}
                    className="size-5 shrink-0 text-primary"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate font-medium">{entry.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, PackageCheck, ShieldCheck, Truck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ProductAssurance } from "@/features/catalog/components/product-assurance";
import { ProductBuyBox } from "@/features/catalog/components/product-buy-box";
import { ProductCarouselSection } from "@/features/catalog/components/product-carousel-section";
import { ProductDescription } from "@/features/catalog/components/product-description";
import { ProductDocuments } from "@/features/catalog/components/product-documents";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductQuestions } from "@/features/catalog/components/product-questions";
import { ProductSpecs, ProductShipping } from "@/features/catalog/components/product-info-panels";
import { ProductReviews } from "@/features/catalog/components/product-reviews";
import { ProductTabs } from "@/features/catalog/components/product-tabs";
import { StarRating } from "@/features/catalog/components/star-rating";
import { StickyBuyBar } from "@/features/catalog/components/sticky-buy-bar";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import {
  getProductDetail,
  getProducts,
  getRelatedProducts,
} from "@/features/catalog/services";
import { complementaryProducts } from "@/features/catalog/services/complements";
import { getSiteSettings } from "@/features/settings/services/settings";
import { formatBDT } from "@/lib/format";
import { STOCK_LABEL, discountPercent, resolvePriceDisplay } from "@/features/catalog/services/product";
import { cn } from "@/lib/utils";
import type {
  PriceDisplay,
  StockStatus,
} from "@/features/catalog/types";

/** Anchors the sticky bar: it appears once this element scrolls out of view. */
const BUY_BOX_ID = "buy-box";

/**
 * Product detail page.
 *
 * Prerendered for every product in the catalogue. Nothing on the page depends
 * on the request, so there is no reason to render it per visit — the gallery,
 * tabs and buy box are the only interactive parts, and they hydrate over
 * static HTML.
 *
 * Two things the reference design shows are deliberately absent. The
 * comparison table was dropped on request. The "35 people are viewing this"
 * and "2 sold in the last 10 hours" counters are gone because there is no
 * analytics behind them — inventing live social proof is a lie told to every
 * visitor, and in several markets an actionable one. The slots they occupied
 * carry facts instead: availability, lead time, warranty and delivery.
 */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductDetail(slug);

  if (!result) return { title: "Product not found" };

  const { product } = result;

  return {
    title: `${product.name} — ${product.brand} ${product.modelNumber}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
      type: "website",
    },
  };
}

const STOCK_CLASS: Record<StockStatus, string> = {
  IN_STOCK: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
  LOW_STOCK: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  MADE_TO_ORDER: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900",
  OUT_OF_STOCK: "bg-muted text-muted-foreground ring-border",
};

/** One string for the sticky bar, which has no room for a strikethrough. */
const priceLabel = (price: PriceDisplay): string => {
  if (price.kind === "price") return formatBDT(price.amount);
  if (price.kind === "range") return `${formatBDT(price.min)} – ${formatBDT(price.max)}`;
  return "Price on request";
};

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const [result, settings] = await Promise.all([getProductDetail(slug), getSiteSettings()]);

  if (!result) notFound();

  const { product, detail } = result;

  const price = resolvePriceDisplay(product, "GUEST");
  const discount = discountPercent(product);
  const quoteOnly = price.kind === "quote";
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";

  // Two strips with no overlap: the first is what is closest to this product,
  // the second is everything else. Showing the same five cards twice under
  // different headings would be padding, not a recommendation.
  const complements = complementaryProducts(product);
  const alsoLike = await getRelatedProducts(product, 10);
  const alsoLikeIds = new Set(alsoLike.map((entry) => entry.id));
  const related = (await getRelatedProducts(product, 30))
    .filter((entry) => !alsoLikeIds.has(entry.id))
    .slice(0, 10);

  return (
    <>
      <Container className="py-5">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            {
              label: product.categoryName,
              href: `/products?category=${encodeURIComponent(product.categoryName)}`,
            },
            { label: product.name },
          ]}
        />
      </Container>

      <Container className="pb-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={detail.images} productName={product.name} />

          <div id={BUY_BOX_ID} className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Brand:{" "}
                <Link href={`/products?brand=${encodeURIComponent(product.brand)}`} className="font-medium text-foreground hover:text-primary">
                  {product.brand}
                </Link>
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {product.name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">Model {product.modelNumber}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {price.kind === "price" && (
                <>
                  <span className="text-3xl font-bold tracking-tight text-primary">
                    {formatBDT(price.amount)}
                  </span>
                  {price.compareAt !== null && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatBDT(price.compareAt)}
                    </span>
                  )}
                  {discount !== null && (
                    <span className="rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-white">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}

              {price.kind === "range" && (
                <span className="text-3xl font-bold tracking-tight text-primary">
                  {formatBDT(price.min)} – {formatBDT(price.max)}
                </span>
              )}

              {price.kind === "quote" && (
                <span className="text-2xl font-semibold text-muted-foreground">
                  Price on request
                </span>
              )}

              {product.rating !== null && (
                <span className="flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <a href="#reviews" className="text-sm text-muted-foreground hover:text-foreground">
                    ({product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"})
                  </a>
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <span
              className={cn(
                "w-fit rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                STOCK_CLASS[product.stockStatus],
              )}
            >
              {STOCK_LABEL[product.stockStatus]}
            </span>

            <ProductBuyBox
              productId={product.id}
              productName={product.name}
              model={product.modelNumber}
              quoteOnly={quoteOnly}
              outOfStock={outOfStock}
            />

            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <CalendarClock className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Dispatched in {detail.leadTimeDays} working days
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Delivered nationwide · 7-day returns on unused stock
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                {detail.warrantyMonths}-month warranty, serviced locally
              </li>
              <li className="flex items-center gap-2.5">
                <PackageCheck className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Traceable calibration certificate supplied
              </li>
            </ul>

            <ProductAssurance />

            <ProductDocuments
              documents={detail.documents}
              productName={product.name}
              model={product.modelNumber}
              whatsapp={settings.whatsapp}
            />
          </div>
        </div>

        <div className="mt-16" id="reviews">
          <ProductTabs
            tabs={[
              {
                value: "description",
                label: "Description",
                content: <ProductDescription detail={detail} />,
              },
              {
                value: "specs",
                label: "Additional information",
                content: <ProductSpecs specs={detail.specs} />,
              },
              {
                value: "reviews",
                label: `Reviews (${product.reviewCount})`,
                content: <ProductReviews product={product} reviews={detail.reviews} />,
              },
              {
                value: "shipping",
                label: "Shipping & returns",
                content: <ProductShipping items={detail.shipping} />,
              },
            ]}
          />
        </div>

        <div className="mt-16 border-t pt-12">
          <ProductQuestions
            productName={product.name}
            model={product.modelNumber}
            whatsapp={settings.whatsapp}
          />
        </div>

        <div className="mt-20 space-y-16">
          <ProductCarouselSection
            id="works-with"
            title="Often specified together"
            products={complements}
          />

          <ProductCarouselSection
            id="you-may-also-like"
            title="You may also like"
            products={alsoLike}
          />

          <ProductCarouselSection
            id="related-products"
            title="Related products"
            products={related}
          />
        </div>
      </Container>

      <StickyBuyBar
        sentinelId={BUY_BOX_ID}
        productName={product.name}
        brand={product.brand}
        model={product.modelNumber}
        imageUrl={product.imageUrl}
        priceLabel={priceLabel(price)}
        quoteOnly={quoteOnly}
        outOfStock={outOfStock}
      />
    </>
  );
}

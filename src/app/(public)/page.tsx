import { BrandSlider } from "@/features/home/components/brand-slider";
import { BrandWall } from "@/features/home/components/brand-wall";
import { CategoryCarousel } from "@/features/home/components/category-carousel";
import { FeaturedRows } from "@/features/home/components/featured-rows";
import { HeroCarousel } from "@/features/home/components/hero-carousel";
import { LatestPosts } from "@/features/home/components/latest-posts";
import { PromoBanner } from "@/features/home/components/promo-banner";
import { ServicesBand } from "@/features/home/components/services-band";
import { Testimonial } from "@/features/home/components/testimonial";
import { TrendingProducts } from "@/features/home/components/trending-products";
import { TrustStrip } from "@/features/home/components/trust-strip";
import { Container } from "@/components/layout/container";
import { getSiteSettings } from "@/features/settings/services/settings";
import FeaturedProducts from "@/features/home/components/featured-products";
import {
  getBrands,
  getCategories,
  getProducts,
  getTopSellingProducts,
  getTrendingProducts,
} from "@/features/catalog/services";
import {
  getFeatures,
  getHeroSlides,
  getLatestPosts,
  getPromotions,
  getServices,
  getTestimonials,
} from "@/features/content/services/content";

/**
 * Home page.
 *
 * Section order follows the reference design, with one structural change: the
 * laboratory services band sits directly after the product tabs rather than
 * being omitted. Selling an instrument without mentioning that its annual
 * calibration is handled here leaves the recurring revenue on the table.
 *
 * All reads are issued together — awaiting them in sequence would make the
 * page as slow as their sum. Everything renders on the server; only the
 * category carousel, product tabs and card actions ship JavaScript.
 */
export default async function HomePage() {
  const [
    brands,
    categories,
    features,
    heroSlides,
    posts,
    products,
    promotions,
    services,
    testimonials,
    settings,
    topSelling,
    trending,
  ] = await Promise.all([
    getBrands(),
    getCategories(),
    getFeatures(),
    getHeroSlides(),
    getLatestPosts(3),
    getProducts(),
    getPromotions(),
    getServices(),
    getTestimonials(),
    getSiteSettings(),
    getTopSellingProducts(10),
    getTrendingProducts(14, 10),
  ]);

  // The page has five fixed promo slots (two paired, one wide, two paired).
  // They fill positionally from the admin-ordered list, so reordering a
  // promotion's display order in `/admin/promotions` reorders the page.
  const [insulation, thermal, wide, safety, power] = promotions;

  return (
    <>
      {/*
        The home page has no visible page title — the hero carousel leads, and
        each of its three slides carries its own h2. That left the most
        important page on the site as the only one with no h1 at all, which is
        a real defect for search engines and for anyone navigating by heading.
        A screen-reader-only h1 names the business once, without forcing a
        heading into a design that does not want one.
      */}
      <h1 className="sr-only">
        {settings.name} — {settings.shortDescription}
      </h1>

      <HeroCarousel slides={heroSlides} />
      <div className="space-y-14 py-6 sm:space-y-20 sm:py-10">
        <Container>
          <BrandSlider brands={brands.slice(0, 6)} />
        </Container>

        <Container>
          <CategoryCarousel categories={categories} />
        </Container>

        {/* Real sales data, not editorial picks — both sections quietly render
          nothing until there is enough order history to rank from. */}
        <Container>
          <FeaturedProducts
            products={topSelling}
            title="Top selling"
            subtitle="Our most-ordered instruments, all time."
            headingId="top-selling-heading"
          />
        </Container>

        <Container>
          <FeaturedProducts
            products={trending}
            title="Trending now"
            subtitle="What customers have been ordering over the last two weeks."
            headingId="trending-now-heading"
          />
        </Container>

        {/* Paired promos — the reference splits the width here to break up the
          run of product grids. */}
        {insulation && thermal && (
          <Container>
            <div className="grid gap-4 md:grid-cols-2">
              <PromoBanner promotion={insulation} />
              <PromoBanner promotion={thermal} />
            </div>
          </Container>
        )}

        <Container>
          <TrendingProducts
            products={products}
            subtitle="What our customers are specifying this month, by discipline."
          />
        </Container>

        <Container>
          <TrustStrip features={features} />
        </Container>

        <Container>
          <ServicesBand services={services} />
        </Container>

        {wide && (
          <Container>
            <PromoBanner promotion={wide} size="wide" />
          </Container>
        )}

        <Container>
          <FeaturedRows
            products={products.slice(8, 20)}
            subtitle="Hand-picked instruments our application engineers recommend most often."
          />
        </Container>

        <Container>
          <Testimonial testimonials={testimonials} />
        </Container>

        <Container>
          <FeaturedProducts
            products={products.slice(0, 16)}
            tier="GUEST"
            title="Special offers"
          />
        </Container>

        {safety && power && (
          <Container>
            <div className="grid gap-4 md:grid-cols-2">
              <PromoBanner promotion={safety} />
              <PromoBanner promotion={power} />
            </div>
          </Container>
        )}

        <Container>
          <BrandWall brands={brands} />
        </Container>

        <Container>
          <LatestPosts posts={posts} />
        </Container>
      </div>
    </>
  );
}

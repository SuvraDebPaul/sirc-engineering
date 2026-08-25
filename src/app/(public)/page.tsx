import { BrandSlider } from "@/features/home/components/brand-slider";
import { BrandWall } from "@/features/home/components/brand-wall";
import { CategoryCarousel } from "@/features/home/components/category-carousel";
import { HeroCarousel } from "@/features/home/components/hero-carousel";
import { LatestPosts } from "@/features/home/components/latest-posts";
import { PromoBanner } from "@/features/home/components/promo-banner";
import { ServicesBand } from "@/features/home/components/services-band";
import { Testimonial } from "@/features/home/components/testimonial";
import { TrendingProducts } from "@/features/home/components/trending-products";
import { TrustStrip } from "@/features/home/components/trust-strip";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
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

  const [insulation, thermal, wide, safety, power] = promotions;

  return (
    <>
      <h1 className="sr-only">
        {settings.name} — {settings.shortDescription}
      </h1>

      <HeroCarousel slides={heroSlides} />
      {/* Each band is wrapped in `Reveal`, so it animates in as it reaches the
          viewport. The hero is deliberately not wrapped — it is already on
          screen at load, and fading in the first thing a visitor sees delays
          the page rather than decorating it. */}
      <div className="space-y-14 py-6 sm:space-y-20 sm:py-10">
        <Reveal>
          <Container>
            <BrandSlider brands={brands.slice(0, 6)} />
          </Container>
        </Reveal>

        <Reveal>
          <Container>
            <CategoryCarousel categories={categories} />
          </Container>
        </Reveal>

        <Reveal>
          <Container>
            <FeaturedProducts
              products={topSelling}
              title="Top selling"
              subtitle="Our most-ordered instruments, all time."
              headingId="top-selling-heading"
            />
          </Container>
        </Reveal>

        <Reveal>
          <Container>
            <FeaturedProducts
              products={trending}
              title="Trending now"
              subtitle="What customers have been ordering over the last two weeks."
              headingId="trending-now-heading"
            />
          </Container>
        </Reveal>

        {/* Paired promos — the reference splits the width here to break up the
          run of product grids. Staggered so the two cards arrive in sequence
          rather than as one block. */}
        {insulation && thermal && (
          <Container>
            <Reveal stagger className="grid gap-4 md:grid-cols-2">
              <PromoBanner promotion={insulation} />
              <PromoBanner promotion={thermal} />
            </Reveal>
          </Container>
        )}

        <Reveal>
          <Container>
            <TrendingProducts products={products} trending={trending} topSelling={topSelling} />
          </Container>
        </Reveal>

        <Reveal>
          <Container>
            <TrustStrip features={features} />
          </Container>
        </Reveal>

        <Reveal>
          <Container>
            <ServicesBand services={services} />
          </Container>
        </Reveal>

        {wide && (
          <Reveal>
            <Container>
              <PromoBanner promotion={wide} size="wide" />
            </Container>
          </Reveal>
        )}

        <Reveal>
          <Container>
            <Testimonial testimonials={testimonials} />
          </Container>
        </Reveal>

        {safety && power && (
          <Container>
            <Reveal stagger className="grid gap-4 md:grid-cols-2">
              <PromoBanner promotion={safety} />
              <PromoBanner promotion={power} />
            </Reveal>
          </Container>
        )}

        <Reveal>
          <Container>
            <BrandWall brands={brands} />
          </Container>
        </Reveal>

        <Reveal>
          <Container>
            <LatestPosts posts={posts} />
          </Container>
        </Reveal>
      </div>
    </>
  );
}

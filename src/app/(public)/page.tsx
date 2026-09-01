import { HeroCarousel } from "@/features/home/components/hero-carousel";
import { LatestPosts } from "@/features/home/components/latest-posts";
import { ServicesBand } from "@/features/home/components/services-band";
import { Testimonial } from "@/features/home/components/testimonial";
import { TrendingProducts } from "@/features/home/components/trending-products";
import { TrustStrip } from "@/features/home/components/trust-strip";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { getSiteSettings } from "@/features/settings/services/settings";
import FeaturedProducts from "@/features/home/components/featured-products";
import {
  getProducts,
  getTopSellingProducts,
  getTrendingProducts,
} from "@/features/catalog/services";
import {
  getFeatures,
  getHeroSlides,
  getLatestPosts,
  getServices,
  getTestimonials,
} from "@/features/content/services/content";

export default async function HomePage() {
  const [
    features,
    heroSlides,
    posts,
    products,
    services,
    testimonials,
    settings,
    topSelling,
    trending,
  ] = await Promise.all([
    getFeatures(),
    getHeroSlides(),
    getLatestPosts(3),
    getProducts(),
    getServices(),
    getTestimonials(),
    getSiteSettings(),
    getTopSellingProducts(10),
    getTrendingProducts(14, 10),
  ]);

  return (
    <>
      <h1 className="sr-only">
        {settings.name} — {settings.shortDescription}
      </h1>

      <HeroCarousel slides={heroSlides} />

      <div className="space-y-14 py-6 sm:space-y-20 sm:py-10">
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

        <Reveal>
          <Container>
            <TrendingProducts
              products={products}
              trending={trending}
              topSelling={topSelling}
            />
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

        <Reveal>
          <Container>
            <Testimonial testimonials={testimonials} />
          </Container>
        </Reveal>

        <Reveal>
          <Container className="mt-32">
            <LatestPosts posts={posts} />
          </Container>
        </Reveal>
      </div>
    </>
  );
}

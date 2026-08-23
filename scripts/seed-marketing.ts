/**
 * One-time seed: promotes the old static home-page marketing content (hero
 * slides, banner tiles, trust-strip features, customer quotes) into the
 * database.
 *
 * Run once, after this content switched from `@/data` to real rows, so the
 * admin panel isn't starting from an empty home page. Upserts on a
 * deterministic id per row (derived from the old static id) so re-running is
 * safe and won't duplicate anything.
 */
import { FEATURES, HERO_SLIDES, PROMOTIONS, TESTIMONIALS } from "@/data/content";
import { prisma } from "@/lib/db/prisma";

async function main() {
  let heroCount = 0;
  for (const [index, slide] of HERO_SLIDES.entries()) {
    await prisma.promotion.upsert({
      where: { id: slide.id },
      update: {},
      create: {
        id: slide.id,
        placement: "hero",
        eyebrow: slide.eyebrow,
        title: slide.title,
        subtitle: slide.subtitle ?? null,
        ctaLabel: slide.ctaLabel,
        href: slide.href,
        imageUrl: slide.imageUrl,
        tone: slide.tone,
        sortOrder: index,
      },
    });
    heroCount += 1;
  }

  let promoCount = 0;
  for (const [index, promo] of PROMOTIONS.entries()) {
    await prisma.promotion.upsert({
      where: { id: promo.id },
      update: {},
      create: {
        id: promo.id,
        placement: "banner",
        eyebrow: promo.eyebrow,
        title: promo.title,
        subtitle: promo.subtitle ?? null,
        ctaLabel: promo.ctaLabel,
        href: promo.href,
        imageUrl: promo.imageUrl,
        tone: promo.tone,
        sortOrder: index,
      },
    });
    promoCount += 1;
  }

  let featureCount = 0;
  for (const [index, feature] of FEATURES.entries()) {
    await prisma.feature.upsert({
      where: { id: feature.id },
      update: {},
      create: {
        id: feature.id,
        icon: feature.icon,
        title: feature.title,
        description: feature.description,
        sortOrder: index,
      },
    });
    featureCount += 1;
  }

  let testimonialCount = 0;
  for (const [index, testimonial] of TESTIMONIALS.entries()) {
    await prisma.testimonial.upsert({
      where: { id: testimonial.id },
      update: {},
      create: {
        id: testimonial.id,
        headline: testimonial.headline,
        quote: testimonial.quote,
        authorName: testimonial.authorName,
        authorRole: testimonial.authorRole,
        company: testimonial.company,
        imageUrl: testimonial.imageUrl ?? null,
        sortOrder: index,
      },
    });
    testimonialCount += 1;
  }

  console.log(
    `Hero slides: ${heroCount}, Banner tiles: ${promoCount}, Features: ${featureCount}, Testimonials: ${testimonialCount}`,
  );
}

main().then(() => process.exit(0));

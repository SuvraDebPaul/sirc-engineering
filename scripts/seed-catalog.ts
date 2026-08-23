/**
 * One-time seed: promotes the old static demo catalogue into the database.
 *
 * Run once, after `products.ts`/`categories.ts`/`brands.ts` were switched
 * from `@/data` to Prisma, so the site isn't left with an empty catalogue.
 * Upserts by slug, so re-running is safe and won't duplicate anything the
 * admin panel has already created.
 */
import { BRANDS } from "@/data/brands";
import { CATEGORIES } from "@/data/categories";
import { PRODUCTS } from "@/data/products";
import { PRODUCT_DETAILS } from "@/data/product-details";
import { Prisma, prisma } from "@/lib/db/prisma";

async function main() {
  const categoryIdBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        imageUrl: category.imageUrl ?? null,
      },
    });
    categoryIdBySlug.set(category.slug, row.id);
  }
  console.log(`Categories: ${categoryIdBySlug.size}`);

  const brandIdByName = new Map<string, string>();
  for (const brand of BRANDS) {
    const slug = brand.id;
    const row = await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: {
        name: brand.name,
        slug,
        logoUrl: brand.logoUrl,
      },
    });
    brandIdByName.set(brand.name, row.id);
  }
  console.log(`Brands: ${brandIdByName.size}`);

  const categoryIdByName = new Map(
    CATEGORIES.map((category) => [category.name, categoryIdBySlug.get(category.slug)!]),
  );

  let productCount = 0;
  for (const product of PRODUCTS) {
    const categoryId = categoryIdByName.get(product.categoryName);
    const brandId = brandIdByName.get(product.brand);
    if (!categoryId || !brandId) {
      console.warn(`Skipping "${product.name}" — unresolved category/brand`);
      continue;
    }

    const detail = PRODUCT_DETAILS.find((entry) => entry.slug === product.slug);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        modelNumber: product.modelNumber,
        imageUrl: product.imageUrl,
        categoryId,
        brandId,
        subCategoryName: product.subCategoryName,
        badge: product.badge,
        retailPrice: product.retailPrice,
        compareAtPrice: product.compareAtPrice,
        priceMin: product.priceMin,
        priceMax: product.priceMax,
        stockStatus: product.stockStatus,
        isQuoteOnly: product.isQuoteOnly,
        rating: product.rating,
        reviewCount: product.reviewCount,
        overview: detail?.overview ?? [],
        highlights: detail?.highlights ?? [],
        sections: (detail?.sections ?? []) as unknown as Prisma.InputJsonValue,
        specs: (detail?.specs ?? []) as unknown as Prisma.InputJsonValue,
        images: (detail?.images ?? []) as unknown as Prisma.InputJsonValue,
        documents: (detail?.documents ?? []) as unknown as Prisma.InputJsonValue,
        shipping: detail?.shipping ?? [],
        leadTimeDays: detail?.leadTimeDays ?? 5,
        warrantyMonths: detail?.warrantyMonths ?? 12,
      },
    });
    productCount += 1;
  }
  console.log(`Products: ${productCount}`);
}

main().then(() => process.exit(0));

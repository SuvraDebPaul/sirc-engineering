import { prisma } from "@/lib/db/prisma";

export async function getBundleItemsAdmin(productId: string) {
  return prisma.bundleItem.findMany({
    where: { productId },
    include: {
      companion: { select: { id: true, name: true, modelNumber: true, imageUrl: true } },
    },
    orderBy: { position: "asc" },
  });
}

/** Replaces the whole list — small enough (a handful of rows) that delete-and-recreate is simpler than diffing. */
export async function setBundleItems(
  productId: string,
  items: { companionId: string; moq: number }[],
): Promise<void> {
  await prisma.$transaction([
    prisma.bundleItem.deleteMany({ where: { productId } }),
    ...items.map((item, index) =>
      prisma.bundleItem.create({
        data: { productId, companionId: item.companionId, moq: item.moq, position: index },
      }),
    ),
  ]);
}

export interface BundleEntry {
  product: {
    id: string;
    name: string;
    slug: string;
    modelNumber: string;
    imageUrl: string | null;
    retailPrice: number;
  };
  moq: number;
}

/**
 * The "frequently bought together" companions for a product.
 *
 * A companion with no single price (quote-only, or priced as a range) can't
 * be summed into a bundle total, so it's silently dropped here rather than
 * shown with a broken price — the admin picker still lets it be selected,
 * this is the one place that filters it back out.
 */
export async function getFrequentlyBoughtTogether(productId: string): Promise<BundleEntry[]> {
  const rows = await prisma.bundleItem.findMany({
    where: { productId },
    include: { companion: true },
    orderBy: { position: "asc" },
  });

  return rows.flatMap((row) => {
    if (row.companion.retailPrice === null) return [];
    return [
      {
        product: {
          id: row.companion.id,
          name: row.companion.name,
          slug: row.companion.slug,
          modelNumber: row.companion.modelNumber,
          imageUrl: row.companion.imageUrl,
          retailPrice: row.companion.retailPrice,
        },
        moq: row.moq,
      },
    ];
  });
}

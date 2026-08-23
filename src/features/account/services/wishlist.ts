import { prisma } from "@/lib/db/prisma";

/**
 * Server-side mirror of the wishlist, for signed-in customers.
 *
 * Deliberately separate from the localStorage wishlist every visitor
 * already has (`features/cart/services/cart.ts`) — that one keeps working
 * unchanged for guests. This is what lets a signed-in customer's saved
 * items follow them to a different device.
 */
export async function listWishlistForUser(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { category: true, brand: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleWishlistItem(userId: string, productId: string): Promise<boolean> {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.wishlistItem.create({ data: { userId, productId } });
  return true;
}

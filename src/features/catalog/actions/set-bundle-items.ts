"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { setBundleItems } from "@/features/catalog/services/bundles";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

const itemSchema = z.object({
  companionId: z.string().min(1),
  moq: z.coerce.number().int().positive(),
});

export async function setBundleItemsAction(
  productId: string,
  items: { companionId: string; moq: number }[],
): Promise<{ error?: string } | void> {
  await requireStaffSession();

  const result = z
    .array(itemSchema)
    .max(10, "Keep it to 10 companion products or fewer.")
    .safeParse(items);
  if (!result.success) return { error: "Please check the companion products and quantities." };

  const ids = result.data.map((item) => item.companionId);
  if (new Set(ids).size !== ids.length) {
    return { error: "Each companion product can only be added once." };
  }
  if (ids.includes(productId)) return { error: "A product can't be bundled with itself." };

  if (ids.length > 0) {
    const found = await prisma.product.count({ where: { id: { in: ids } } });
    if (found !== ids.length) return { error: "One of the selected products no longer exists." };
  }

  try {
    await setBundleItems(productId, result.data);
  } catch (error) {
    return { error: logUnexpectedError("set-bundle-items", error) };
  }

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (product) revalidatePath(`/product/${product.slug}`);
  revalidatePath(`/admin/products/${productId}/edit`);
}

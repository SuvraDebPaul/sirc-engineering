"use server";

import { revalidatePath } from "next/cache";

import { deleteProduct } from "@/features/catalog/services/product-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteProductAction(
  id: string,
): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteProduct(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-product", error) };
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

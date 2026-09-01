"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/lib/db/prisma";
import { deleteBrand, deleteBrandCascade } from "@/features/catalog/services/brand-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteBrandAction(
  id: string,
): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteBrand(id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error:
          "This brand still has products assigned to it. Move or delete those first.",
      };
    }
    return { error: logUnexpectedError("delete-brand", error) };
  }

  revalidatePath("/admin/brands");
  revalidatePath("/", "layout");
}

/**
 * Delete a brand and every product still under it in one step.
 *
 * Kept as a separate action from `deleteBrandAction` rather than a silent
 * fallback: removing products is a much bigger, less reversible action than
 * removing a brand record, and it should only happen from a confirmation that
 * says so explicitly, never as an automatic retry after the safe delete fails.
 */
export async function deleteBrandCascadeAction(
  id: string,
): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteBrandCascade(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-brand-cascade", error) };
  }

  revalidatePath("/admin/brands");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

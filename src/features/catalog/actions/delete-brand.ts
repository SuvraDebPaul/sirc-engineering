"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/lib/db/prisma";
import { deleteBrand } from "@/features/catalog/services/brand-admin";
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

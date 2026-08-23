"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/db/prisma";
import { deleteCategory } from "@/features/catalog/services/category-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteCategoryAction(
  id: string,
): Promise<{ error?: string } | void> {
  await requireStaffSession();
  try {
    await deleteCategory(id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error:
          "This category still has products assigned to it. Move or delete those first.",
      };
    }
    return { error: logUnexpectedError("delete-category", error) };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

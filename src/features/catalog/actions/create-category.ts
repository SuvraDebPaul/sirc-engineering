"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, prisma } from "@/lib/db/prisma";
import {
  categorySchema,
  type CategoryInput,
} from "@/features/catalog/schemas/category.schema";
import { createCategory } from "@/features/catalog/services/category-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface CategoryFormResult {
  errors?: Partial<Record<"name" | "slug" | "icon" | "parentId" | "form", string>>;
}

export async function createCategoryAction(
  data: CategoryInput,
  imageFile: File | null,
): Promise<CategoryFormResult | void> {
  await requireStaffSession();
  const result = categorySchema.safeParse(data);
  if (!result.success) {
    return {
      errors: firstFieldErrors(z.flattenError(result.error).fieldErrors),
    };
  }

  const parentId = result.data.parentId === "NONE" ? null : result.data.parentId;
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) return { errors: { parentId: "Choose a valid parent category." } };
  }

  try {
    const imageUrl =
      imageFile && imageFile.size > 0
        ? await uploadImage(imageFile, "sirc/categories")
        : null;
    await createCategory({ ...result.data, parentId, imageUrl });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        errors: { slug: "That slug is already used by another category." },
      };
    }
    return { errors: { form: logUnexpectedError("create-category", error) } };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

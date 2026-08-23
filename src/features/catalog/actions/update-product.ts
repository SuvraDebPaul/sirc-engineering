"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma, prisma } from "@/lib/db/prisma";
import {
  productSchema,
  type ProductInput,
} from "@/features/catalog/schemas/product.schema";
import {
  updateProduct,
  getProductByIdAdmin,
  toProductWriteFields,
} from "@/features/catalog/services/product-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface ProductFormResult {
  errors?: Partial<Record<keyof ProductInput | "images" | "form", string>>;
}

export async function updateProductAction(
  id: string,
  data: ProductInput,
  imageFiles: File[],
): Promise<ProductFormResult | void> {
  await requireStaffSession();

  const result = productSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: firstFieldErrors(z.flattenError(result.error).fieldErrors),
    };
  }

  const [category, brand] = await Promise.all([
    prisma.category.findUnique({ where: { id: result.data.categoryId } }),
    prisma.brand.findUnique({ where: { id: result.data.brandId } }),
  ]);
  if (!category) return { errors: { categoryId: "Choose a valid category." } };
  if (!brand) return { errors: { brandId: "Choose a valid brand." } };

  try {
    const validImageFiles = imageFiles.filter((file) => file.size > 0);
    let images: { url: string; caption: string }[];
    let imageUrl: string;

    if (validImageFiles.length > 0) {
      const uploaded = await Promise.all(
        validImageFiles.map((file) => uploadImage(file, "sirc/products")),
      );
      images = uploaded.map((url) => ({ url, caption: result.data.name }));
      imageUrl = images[0].url;
    } else {
      const existing = await getProductByIdAdmin(id);
      images =
        (existing?.images as { url: string; caption: string }[] | undefined) ??
        [];
      imageUrl = existing?.imageUrl ?? "";
    }

    await updateProduct(id, {
      ...toProductWriteFields(result.data),
      imageUrl,
      images,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        errors: { slug: "That slug is already used by another product." },
      };
    }
    return { errors: { form: logUnexpectedError("update-product", error) } };
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

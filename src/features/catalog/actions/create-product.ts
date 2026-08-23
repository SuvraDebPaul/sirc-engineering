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
  createProduct,
  toProductWriteFields,
} from "@/features/catalog/services/product-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface ProductFormResult {
  errors?: Partial<Record<keyof ProductInput | "images" | "form", string>>;
}

export async function createProductAction(
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

  const validImageFiles = imageFiles.filter((file) => file.size > 0);
  if (validImageFiles.length === 0) {
    return { errors: { images: "At least one product image is required." } };
  }

  const [category, brand] = await Promise.all([
    prisma.category.findUnique({ where: { id: result.data.categoryId } }),
    prisma.brand.findUnique({ where: { id: result.data.brandId } }),
  ]);
  if (!category) return { errors: { categoryId: "Choose a valid category." } };
  if (!brand) return { errors: { brandId: "Choose a valid brand." } };

  try {
    const uploaded = await Promise.all(
      validImageFiles.map((file) => uploadImage(file, "sirc/products")),
    );
    const images = uploaded.map((url) => ({ url, caption: result.data.name }));

    await createProduct({
      ...toProductWriteFields(result.data),
      imageUrl: images[0].url,
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
    return { errors: { form: logUnexpectedError("create-product", error) } };
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

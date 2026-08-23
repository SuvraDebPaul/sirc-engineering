"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/lib/db/prisma";
import {
  brandSchema,
  type BrandInput,
} from "@/features/catalog/schemas/brand.schema";
import {
  updateBrand,
  getBrandByIdAdmin,
} from "@/features/catalog/services/brand-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface BrandFormResult {
  errors?: Partial<Record<"name" | "slug" | "logo" | "form", string>>;
}

export async function updateBrandAction(
  id: string,
  data: BrandInput,
  logoFile: File | null,
): Promise<BrandFormResult | void> {
  await requireStaffSession();

  const result = brandSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: firstFieldErrors(z.flattenError(result.error).fieldErrors),
    };
  }

  try {
    const existing = await getBrandByIdAdmin(id);
    let logoUrl = existing?.logoUrl ?? "";

    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadImage(logoFile, "sirc/brands");
    }

    await updateBrand(id, { ...result.data, logoUrl });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        errors: { slug: "That slug is already used by another brand." },
      };
    }
    return { errors: { form: logUnexpectedError("update-brand", error) } };
  }

  revalidatePath("/admin/brands");
  revalidatePath("/", "layout");
  redirect("/admin/brands");
}

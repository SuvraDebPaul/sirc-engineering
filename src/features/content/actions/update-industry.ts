"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/lib/db/prisma";
import {
  industrySchema,
  type IndustryInput,
} from "@/features/content/schemas/industry.schema";
import {
  getIndustryByIdAdmin,
  updateIndustry,
} from "@/features/content/services/industry-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface IndustryFormResult {
  errors?: Partial<Record<keyof IndustryInput | "image" | "form", string>>;
}

export async function updateIndustryAction(
  id: string,
  data: IndustryInput,
  imageFile: File | null,
): Promise<IndustryFormResult | void> {
  await requireStaffSession();

  const result = industrySchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  let existingSlug: string | null = null;

  try {
    const existing = await getIndustryByIdAdmin(id);
    existingSlug = existing?.slug ?? null;
    let imageUrl = existing?.imageUrl ?? "";
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, "sirc/industries");
    }

    await updateIndustry(id, { ...result.data, imageUrl });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { slug: "That slug is already used by another industry." } };
    }
    return { errors: { form: logUnexpectedError("update-industry", error) } };
  }

  revalidatePath("/admin/industries");
  revalidatePath("/", "layout");
  if (existingSlug) revalidatePath(`/industries/${existingSlug}`);
  if (existingSlug !== result.data.slug) revalidatePath(`/industries/${result.data.slug}`);
  redirect("/admin/industries");
}

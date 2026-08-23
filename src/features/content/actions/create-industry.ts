"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/lib/db/prisma";
import {
  industrySchema,
  type IndustryInput,
} from "@/features/content/schemas/industry.schema";
import { createIndustry } from "@/features/content/services/industry-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface IndustryFormResult {
  errors?: Partial<Record<keyof IndustryInput | "image" | "form", string>>;
}

export async function createIndustryAction(
  data: IndustryInput,
  imageFile: File | null,
): Promise<IndustryFormResult | void> {
  await requireStaffSession();

  const result = industrySchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  if (!imageFile || imageFile.size === 0) {
    return { errors: { image: "A cover image is required." } };
  }

  try {
    const imageUrl = await uploadImage(imageFile, "sirc/industries");
    await createIndustry({ ...result.data, imageUrl });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { slug: "That slug is already used by another industry." } };
    }
    return { errors: { form: logUnexpectedError("create-industry", error) } };
  }

  revalidatePath("/admin/industries");
  revalidatePath("/", "layout");
  redirect("/admin/industries");
}

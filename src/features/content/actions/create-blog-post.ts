"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/lib/db/prisma";
import {
  blogPostSchema,
  type BlogPostInput,
} from "@/features/content/schemas/blog-post.schema";
import { createBlogPost } from "@/features/content/services/blog-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface BlogPostFormResult {
  errors?: Partial<Record<keyof BlogPostInput | "image" | "form", string>>;
}

export async function createBlogPostAction(
  data: BlogPostInput,
  imageFile: File | null,
): Promise<BlogPostFormResult | void> {
  await requireStaffSession();

  const result = blogPostSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  if (!imageFile || imageFile.size === 0) {
    return { errors: { image: "A cover image is required." } };
  }

  try {
    const imageUrl = await uploadImage(imageFile, "sirc/blog");
    await createBlogPost({
      ...result.data,
      publishedAt: new Date(result.data.publishedAt),
      imageUrl,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { slug: "That slug is already used by another post." } };
    }
    return { errors: { form: logUnexpectedError("create-blog-post", error) } };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/", "layout");
  redirect("/admin/blog");
}

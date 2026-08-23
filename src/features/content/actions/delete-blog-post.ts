"use server";

import { revalidatePath } from "next/cache";

import { deleteBlogPost } from "@/features/content/services/blog-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteBlogPostAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteBlogPost(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-blog-post", error) };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/", "layout");
}

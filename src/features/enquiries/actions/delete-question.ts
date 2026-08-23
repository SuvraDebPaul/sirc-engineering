"use server";

import { revalidatePath } from "next/cache";

import { deleteQuestion } from "@/features/enquiries/services/product-questions";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteQuestionAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteQuestion(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-question", error) };
  }

  revalidatePath("/admin/questions");
}

"use server";

import { revalidatePath } from "next/cache";

import { answerQuestion } from "@/features/enquiries/services/product-questions";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";
import { prisma } from "@/lib/db/prisma";

export async function answerQuestionAction(
  id: string,
  answer: string,
): Promise<{ error?: string } | void> {
  await requireStaffSession();

  const trimmed = answer.trim();
  if (trimmed.length < 3) return { error: "Please write a short answer first." };

  try {
    const question = await answerQuestion(id, trimmed);
    const product = await prisma.product.findUnique({
      where: { id: question.productId },
      select: { slug: true },
    });
    if (product) revalidatePath(`/product/${product.slug}`);
  } catch (error) {
    return { error: logUnexpectedError("answer-question", error) };
  }

  revalidatePath("/admin/questions");
}

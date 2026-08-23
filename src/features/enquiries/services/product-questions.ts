import { prisma } from "@/lib/db/prisma";

/** Only answered questions are ever public — this is the sole read for the storefront. */
export async function listAnsweredQuestions(productId: string) {
  return prisma.productQuestion.findMany({
    where: { productId, answer: { not: null } },
    orderBy: { answeredAt: "desc" },
  });
}

export async function createQuestion(
  productId: string,
  data: { email: string; question: string },
) {
  return prisma.productQuestion.create({ data: { productId, ...data } });
}

export async function listQuestionsAdmin(status: "pending" | "answered" | "all" = "pending") {
  return prisma.productQuestion.findMany({
    where:
      status === "pending"
        ? { answer: null }
        : status === "answered"
          ? { answer: { not: null } }
          : {},
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function answerQuestion(id: string, answer: string) {
  return prisma.productQuestion.update({
    where: { id },
    data: { answer, answeredAt: new Date() },
  });
}

export async function deleteQuestion(id: string) {
  return prisma.productQuestion.delete({ where: { id } });
}

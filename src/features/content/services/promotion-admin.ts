import { prisma } from "@/lib/db/prisma";

export async function listPromotionsAdmin() {
  return prisma.promotion.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] });
}

export async function getPromotionByIdAdmin(id: string) {
  return prisma.promotion.findUnique({ where: { id } });
}

export interface PromotionWriteData {
  placement: string;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string;
  href: string;
  tone: string;
  sortOrder: number;
  imageUrl: string;
}

export async function createPromotion(data: PromotionWriteData) {
  return prisma.promotion.create({ data });
}

export async function updatePromotion(id: string, data: PromotionWriteData) {
  return prisma.promotion.update({ where: { id }, data });
}

export async function deletePromotion(id: string) {
  return prisma.promotion.delete({ where: { id } });
}

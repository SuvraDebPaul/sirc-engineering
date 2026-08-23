import { prisma } from "@/lib/db/prisma";
import type { IndustryInput } from "@/features/content/schemas/industry.schema";

export async function listIndustriesAdmin() {
  return prisma.industry.findMany({ orderBy: { name: "asc" } });
}

export async function getIndustryByIdAdmin(id: string) {
  return prisma.industry.findUnique({ where: { id } });
}

export async function createIndustry(data: IndustryInput & { imageUrl: string }) {
  return prisma.industry.create({ data });
}

export async function updateIndustry(id: string, data: IndustryInput & { imageUrl: string }) {
  return prisma.industry.update({ where: { id }, data });
}

export async function deleteIndustry(id: string) {
  return prisma.industry.delete({ where: { id } });
}

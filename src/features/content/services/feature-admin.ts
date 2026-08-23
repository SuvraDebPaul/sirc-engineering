import { prisma } from "@/lib/db/prisma";
import type { FeatureInput } from "@/features/content/schemas/feature.schema";

export async function listFeaturesAdmin() {
  return prisma.feature.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getFeatureByIdAdmin(id: string) {
  return prisma.feature.findUnique({ where: { id } });
}

export async function createFeature(data: FeatureInput) {
  return prisma.feature.create({ data });
}

export async function updateFeature(id: string, data: FeatureInput) {
  return prisma.feature.update({ where: { id }, data });
}

export async function deleteFeature(id: string) {
  return prisma.feature.delete({ where: { id } });
}

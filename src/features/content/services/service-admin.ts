import { prisma } from "@/lib/db/prisma";
import type { ServiceInput } from "@/features/content/schemas/service.schema";

export async function listServicesAdmin() {
  return prisma.service.findMany({ orderBy: { title: "asc" } });
}

export async function getServiceByIdAdmin(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export async function createService(data: ServiceInput & { imageUrl: string }) {
  return prisma.service.create({ data });
}

export async function updateService(id: string, data: ServiceInput & { imageUrl: string }) {
  return prisma.service.update({ where: { id }, data });
}

export async function deleteService(id: string) {
  return prisma.service.delete({ where: { id } });
}

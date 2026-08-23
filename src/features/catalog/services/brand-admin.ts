import { prisma } from "@/lib/db/prisma";
import { BrandInput } from "../schemas/brand.schema";

export async function listBrandsAdmin() {
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getBrandByIdAdmin(id: string) {
  return prisma.brand.findUnique({
    where: { id },
  });
}

export async function createBrand(data: BrandInput & { logoUrl: string }) {
  return prisma.brand.create({ data });
}

export async function updateBrand(id: string, data: BrandInput & { logoUrl: string }) {
  return prisma.brand.update({ where: { id }, data });
}

export async function deleteBrand(id: string) {
  return prisma.brand.delete({ where: { id } });
}

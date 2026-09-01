import { prisma } from "@/lib/db/prisma";
import { BrandInput } from "../schemas/brand.schema";

export async function listBrandsAdmin() {
  return prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
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

/**
 * Delete a brand together with every product still assigned to it.
 *
 * `Product.brandId` is a required column, so there is no "orphan the
 * products" middle ground — the caller has already been told how many would
 * go and confirmed it. Both deletes run in one transaction: a brand cannot be
 * removed while its products survive it, or vice versa.
 */
export async function deleteBrandCascade(id: string) {
  return prisma.$transaction([
    prisma.product.deleteMany({ where: { brandId: id } }),
    prisma.brand.delete({ where: { id } }),
  ]);
}

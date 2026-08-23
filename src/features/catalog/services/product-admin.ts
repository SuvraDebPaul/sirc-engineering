import { prisma } from "@/lib/db/prisma";
import { takaToPoisha } from "@/lib/money";
import { ProductInput } from "../schemas/product.schema";

export async function listProductsAdmin() {
  return prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductByIdAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true },
  });
}

export interface ProductWriteData {
  name: string;
  slug: string;
  description: string;
  modelNumber: string;
  categoryId: string;
  brandId: string;
  subCategoryName: string | null;
  badge: string | null;
  retailPrice: number | null;
  compareAtPrice: number | null;
  priceMin: number | null;
  priceMax: number | null;
  stockStatus: string;
  isQuoteOnly: boolean;
  overview: string[];
  highlights: string[];
  sections: { title: string; body: string }[];
  specs: { label: string; value: string }[];
  documents: {
    title: string;
    kind: string;
    url: string | null;
    sizeLabel?: string;
  }[];
  shipping: string[];
  leadTimeDays: number;
  warrantyMonths: number;
  imageUrl: string | null;
  images: { url: string; caption: string }[];
}

export async function createProduct(data: ProductWriteData) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: ProductWriteData) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export function toProductWriteFields(input: ProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    modelNumber: input.modelNumber,
    categoryId: input.categoryId,
    brandId: input.brandId,
    subCategoryName: input.subCategoryName || null,
    badge: input.badge === "NONE" ? null : input.badge,
    retailPrice: takaToPoisha(input.retailPrice),
    compareAtPrice: takaToPoisha(input.compareAtPrice),
    priceMin: takaToPoisha(input.priceMin),
    priceMax: takaToPoisha(input.priceMax),
    stockStatus: input.stockStatus,
    isQuoteOnly: input.isQuoteOnly,
    overview: input.overview,
    highlights: input.highlights,
    sections: input.sections,
    specs: input.specs,
    documents: input.documents,
    shipping: input.shipping,
    leadTimeDays: input.leadTimeDays,
    warrantyMonths: input.warrantyMonths,
  };
}

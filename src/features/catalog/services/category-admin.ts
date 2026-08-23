import { prisma } from "@/lib/db/prisma";
import { CategoryInput } from "../schemas/category.schema";

export async function listCategoriesAdmin() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getCategoryByIdAdmin(id: string) {
  return prisma.category.findUnique({
    where: { id },
  });
}

export interface CategoryWriteData {
  name: string;
  slug: string;
  icon: CategoryInput["icon"];
  imageUrl: string | null;
  parentId: string | null;
}

export async function createCategory(data: CategoryWriteData) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: CategoryWriteData) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

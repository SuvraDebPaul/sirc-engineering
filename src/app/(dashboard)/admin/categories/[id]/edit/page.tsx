import { notFound } from "next/navigation";

import {
  getCategoryByIdAdmin,
  listCategoriesAdmin,
} from "@/features/catalog/services/category-admin";
import { CategoryForm } from "@/features/catalog/components/category-form";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]/edit">) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    getCategoryByIdAdmin(id),
    listCategoriesAdmin(),
  ]);

  if (!category) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Edit category</h1>
      <div className="mt-6">
        <CategoryForm category={category} categories={categories} />
      </div>
    </div>
  );
}

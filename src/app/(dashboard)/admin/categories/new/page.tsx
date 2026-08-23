import { CategoryForm } from "@/features/catalog/components/category-form";
import { listCategoriesAdmin } from "@/features/catalog/services/category-admin";

export default async function NewCategoryPage() {
  const categories = await listCategoriesAdmin();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add category</h1>
      <div className="mt-6">
        <CategoryForm categories={categories} />
      </div>
    </div>
  );
}

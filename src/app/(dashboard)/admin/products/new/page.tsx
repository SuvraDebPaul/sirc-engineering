import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { listCategoriesAdmin } from "@/features/catalog/services/category-admin";
import { listBrandsAdmin } from "@/features/catalog/services/brand-admin";
import { ProductForm } from "@/features/catalog/components/product-form";
import { Button } from "@/components/ui/button";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([listCategoriesAdmin(), listBrandsAdmin()]);

  if (categories.length === 0 || brands.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6 text-center">
        <AlertTriangle className="mx-auto size-8 text-amber-600" aria-hidden="true" />
        <h1 className="mt-3 font-semibold">Add a category and a brand first</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every product needs both.{" "}
          {categories.length === 0 && "You have no categories yet. "}
          {brands.length === 0 && "You have no brands yet."}
        </p>
        <div className="mt-4 flex justify-center gap-3">
          {categories.length === 0 && (
            <Button asChild variant="outline">
              <Link href="/admin/categories/new">Add category</Link>
            </Button>
          )}
          {brands.length === 0 && (
            <Button asChild variant="outline">
              <Link href="/admin/brands/new">Add brand</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} brands={brands} />
      </div>
    </div>
  );
}

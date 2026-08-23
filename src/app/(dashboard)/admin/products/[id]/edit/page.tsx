import { notFound } from "next/navigation";

import { getProductByIdAdmin } from "@/features/catalog/services/product-admin";
import { listCategoriesAdmin } from "@/features/catalog/services/category-admin";
import { listBrandsAdmin } from "@/features/catalog/services/brand-admin";
import { getBundleItemsAdmin } from "@/features/catalog/services/bundles";
import { ProductForm } from "@/features/catalog/components/product-form";
import { BundleItemsEditor } from "@/features/catalog/components/bundle-items-editor";
import { prisma } from "@/lib/db/prisma";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  const [product, categories, brands, bundleItems, otherProducts] = await Promise.all([
    getProductByIdAdmin(id),
    listCategoriesAdmin(),
    listBrandsAdmin(),
    getBundleItemsAdmin(id),
    prisma.product.findMany({
      where: { id: { not: id } },
      select: { id: true, name: true, modelNumber: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit product</h1>
        <div className="mt-6">
          <ProductForm product={product} categories={categories} brands={brands} />
        </div>
      </div>

      <div className="max-w-3xl border-t pt-8">
        <BundleItemsEditor
          productId={product.id}
          products={otherProducts}
          initialItems={bundleItems.map((item) => ({ companionId: item.companionId, moq: item.moq }))}
        />
      </div>
    </div>
  );
}

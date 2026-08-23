import Link from "next/link";
import Image from "next/image";
import { Package, Plus } from "lucide-react";

import { listProductsAdmin } from "@/features/catalog/services/product-admin";
import { deleteProductAction } from "@/features/catalog/actions/delete-product";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatBDT } from "@/lib/format";

const STOCK_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  IN_STOCK: "default",
  LOW_STOCK: "secondary",
  MADE_TO_ORDER: "outline",
  OUT_OF_STOCK: "destructive",
};

const STOCK_LABEL: Record<string, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  MADE_TO_ORDER: "Made to order",
  OUT_OF_STOCK: "Out of stock",
};

export default async function AdminProductsPage() {
  const products = await listProductsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit and manage stock levels for every instrument in the catalogue.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" aria-hidden="true" />
            Add product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start building the catalogue."
          actions={
            <Button asChild>
              <Link href="/admin/products/new">Add product</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Product</th>
                    <th className="px-6 py-2 font-medium">Category</th>
                    <th className="px-6 py-2 font-medium">Brand</th>
                    <th className="px-6 py-2 font-medium">Price</th>
                    <th className="px-6 py-2 font-medium">Stock</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt=""
                              width={40}
                              height={40}
                              className="size-10 shrink-0 rounded-md border object-cover"
                            />
                          ) : (
                            <span className="grid size-10 shrink-0 place-items-center rounded-md border bg-muted text-muted-foreground">
                              <Package className="size-4" aria-hidden="true" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium">{product.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{product.modelNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{product.category.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{product.brand.name}</td>
                      <td className="px-6 py-3">
                        {product.retailPrice !== null ? formatBDT(product.retailPrice) : "—"}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={STOCK_VARIANT[product.stockStatus] ?? "outline"}>
                          {STOCK_LABEL[product.stockStatus] ?? product.stockStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                          </Button>
                          <ConfirmDeleteButton
                            name={product.name}
                            action={deleteProductAction.bind(null, product.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

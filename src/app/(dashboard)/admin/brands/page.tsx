import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Plus } from "lucide-react";

import { listBrandsAdmin } from "@/features/catalog/services/brand-admin";
import { DeleteBrandButton } from "@/features/catalog/components/delete-brand-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AdminBrandsPage() {
  const brands = await listBrandsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Brands</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the manufacturers you supply and the brand pages customers
            see.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="size-4" aria-hidden="true" />
            Add brand
          </Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title="No brands yet"
          description="Add your first brand to start building the catalogue."
          actions={
            <Button asChild>
              <Link href="/admin/brands/new">Add brand</Link>
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
                    <th className="px-6 py-2 font-medium">Logo</th>
                    <th className="px-6 py-2 font-medium">Brand</th>
                    <th className="px-6 py-2 font-medium">Slug</th>
                    <th className="px-6 py-2 font-medium">Products</th>
                    <th className="px-6 py-2 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <Image
                          src={brand.logoUrl}
                          alt={brand.name}
                          width={80}
                          height={32}
                          className="h-8 w-20 object-contain"
                        />
                      </td>
                      <td className="px-6 py-3 font-medium">{brand.name}</td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {brand.slug}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {brand._count.products}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/brands/${brand.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                          <DeleteBrandButton
                            id={brand.id}
                            name={brand.name}
                            productCount={brand._count.products}
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

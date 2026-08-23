import Link from "next/link";
import { FolderTree, Plus } from "lucide-react";

import { listCategoriesAdmin } from "@/features/catalog/services/category-admin";
import { deleteCategoryAction } from "@/features/catalog/actions/delete-category";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

/** Every top-level category, immediately followed by its own subcategories — so the hierarchy reads top to bottom instead of needing a tree widget. */
function orderByHierarchy<T extends { id: string; parentId: string | null }>(rows: T[]): T[] {
  const children = new Map<string, T[]>();
  for (const row of rows) {
    if (row.parentId === null) continue;
    const bucket = children.get(row.parentId) ?? [];
    bucket.push(row);
    children.set(row.parentId, bucket);
  }

  return rows
    .filter((row) => row.parentId === null)
    .flatMap((parent) => [parent, ...(children.get(parent.id) ?? [])]);
}

export default async function AdminCategoriesPage() {
  const categories = orderByHierarchy(await listCategoriesAdmin());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organise the catalogue into the categories customers browse by.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="size-4" aria-hidden="true" />
            Add category
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Add your first category to start organising the catalogue."
          actions={
            <Button asChild>
              <Link href="/admin/categories/new">Add category</Link>
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
                    <th className="px-6 py-2 font-medium">Category</th>
                    <th className="px-6 py-2 font-medium">Slug</th>
                    <th className="px-6 py-2 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <span
                          className="flex items-center gap-2.5"
                          style={category.parentId ? { paddingLeft: "1.5rem" } : undefined}
                        >
                          <Icon
                            name={category.icon}
                            className="size-4 text-primary"
                            aria-hidden="true"
                          />
                          {category.name}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {category.slug}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/admin/categories/${category.id}/edit`}
                            >
                              Edit
                            </Link>
                          </Button>
                          <ConfirmDeleteButton
                            name={category.name}
                            action={deleteCategoryAction.bind(null, category.id)}
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

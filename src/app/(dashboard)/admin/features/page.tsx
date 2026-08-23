import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

import { listFeaturesAdmin } from "@/features/content/services/feature-admin";
import { deleteFeatureAction } from "@/features/content/actions/delete-feature";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AdminFeaturesPage() {
  const features = await listFeaturesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Features</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The trust strip of short selling points shown on the home page.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/features/new">
            <Plus className="size-4" aria-hidden="true" />
            Add feature
          </Link>
        </Button>
      </div>

      {features.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No features yet"
          description="Add your first selling point for the home page."
          actions={
            <Button asChild>
              <Link href="/admin/features/new">Add feature</Link>
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
                    <th className="px-6 py-2 font-medium">Feature</th>
                    <th className="px-6 py-2 font-medium">Order</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {features.map((feature) => (
                    <tr key={feature.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="max-w-xs truncate font-medium">{feature.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{feature.description}</p>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{feature.sortOrder}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/features/${feature.id}/edit`}>Edit</Link>
                          </Button>
                          <ConfirmDeleteButton
                            name={feature.title}
                            action={deleteFeatureAction.bind(null, feature.id)}
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

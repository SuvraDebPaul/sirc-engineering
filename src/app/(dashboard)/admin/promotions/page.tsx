import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";

import { listPromotionsAdmin } from "@/features/content/services/promotion-admin";
import { deletePromotionAction } from "@/features/content/actions/delete-promotion";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

const PLACEMENT_LABELS: Record<string, string> = { hero: "Hero slide", banner: "Banner tile" };

export default async function AdminPromotionsPage() {
  const promotions = await listPromotionsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Promotions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The home page&apos;s hero slides and banner tiles.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/promotions/new">
            <Plus className="size-4" aria-hidden="true" />
            Add promotion
          </Link>
        </Button>
      </div>

      {promotions.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No promotions yet"
          description="Add a hero slide or banner tile for the home page."
          actions={
            <Button asChild>
              <Link href="/admin/promotions/new">Add promotion</Link>
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
                    <th className="px-6 py-2 font-medium">Promotion</th>
                    <th className="px-6 py-2 font-medium">Placement</th>
                    <th className="px-6 py-2 font-medium">Order</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {promotions.map((promotion) => (
                    <tr key={promotion.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="max-w-xs truncate font-medium">{promotion.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{promotion.eyebrow}</p>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={promotion.placement === "hero" ? "default" : "secondary"}>
                          {PLACEMENT_LABELS[promotion.placement] ?? promotion.placement}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{promotion.sortOrder}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/promotions/${promotion.id}/edit`}>Edit</Link>
                          </Button>
                          <ConfirmDeleteButton
                            name={promotion.title}
                            action={deletePromotionAction.bind(null, promotion.id)}
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

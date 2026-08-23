import Link from "next/link";
import { Factory, Plus } from "lucide-react";

import { listIndustriesAdmin } from "@/features/content/services/industry-admin";
import { deleteIndustryAction } from "@/features/content/actions/delete-industry";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AdminIndustriesPage() {
  const industries = await listIndustriesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Industries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the industry sector pages and the content on each one.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/industries/new">
            <Plus className="size-4" aria-hidden="true" />
            Add industry
          </Link>
        </Button>
      </div>

      {industries.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No industries yet"
          description="Add your first industry sector page."
          actions={
            <Button asChild>
              <Link href="/admin/industries/new">Add industry</Link>
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
                    <th className="px-6 py-2 font-medium">Industry</th>
                    <th className="px-6 py-2 font-medium">Summary</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {industries.map((industry) => (
                    <tr key={industry.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="max-w-xs truncate font-medium">{industry.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{industry.slug}</p>
                      </td>
                      <td className="px-6 py-3 max-w-sm truncate text-muted-foreground">
                        {industry.summary}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/industries/${industry.id}/edit`}>Edit</Link>
                          </Button>
                          <ConfirmDeleteButton
                            name={industry.name}
                            action={deleteIndustryAction.bind(null, industry.id)}
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

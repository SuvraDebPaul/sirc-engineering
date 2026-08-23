import Link from "next/link";
import { Plus, Quote } from "lucide-react";

import { listTestimonialsAdmin } from "@/features/content/services/testimonial-admin";
import { deleteTestimonialAction } from "@/features/content/actions/delete-testimonial";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AdminTestimonialsPage() {
  const testimonials = await listTestimonialsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer quotes shown on the home page.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/new">
            <Plus className="size-4" aria-hidden="true" />
            Add testimonial
          </Link>
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <EmptyState
          icon={Quote}
          title="No testimonials yet"
          description="Add your first customer quote for the home page."
          actions={
            <Button asChild>
              <Link href="/admin/testimonials/new">Add testimonial</Link>
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
                    <th className="px-6 py-2 font-medium">Testimonial</th>
                    <th className="px-6 py-2 font-medium">Company</th>
                    <th className="px-6 py-2 font-medium">Order</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {testimonials.map((testimonial) => (
                    <tr key={testimonial.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="max-w-xs truncate font-medium">{testimonial.headline}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {testimonial.authorName}, {testimonial.authorRole}
                        </p>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{testimonial.company}</td>
                      <td className="px-6 py-3 text-muted-foreground">{testimonial.sortOrder}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/testimonials/${testimonial.id}/edit`}>Edit</Link>
                          </Button>
                          <ConfirmDeleteButton
                            name={testimonial.headline}
                            action={deleteTestimonialAction.bind(null, testimonial.id)}
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

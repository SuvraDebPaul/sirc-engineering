import Link from "next/link";
import { Plus, Wrench } from "lucide-react";

import { listServicesAdmin } from "@/features/content/services/service-admin";
import { deleteServiceAction } from "@/features/content/actions/delete-service";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AdminServicesPage() {
  const services = await listServicesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the calibration, testing and inspection services you offer.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="size-4" aria-hidden="true" />
            Add service
          </Link>
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services yet"
          description="Add your first service to start the catalog."
          actions={
            <Button asChild>
              <Link href="/admin/services/new">Add service</Link>
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
                    <th className="px-6 py-2 font-medium">Service</th>
                    <th className="px-6 py-2 font-medium">Turnaround</th>
                    <th className="px-6 py-2 font-medium">On-site</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="max-w-xs truncate font-medium">{service.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{service.slug}</p>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{service.turnaroundDays} days</td>
                      <td className="px-6 py-3 text-muted-foreground">{service.onSite ? "Yes" : "No"}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/services/${service.id}/edit`}>Edit</Link>
                          </Button>
                          <ConfirmDeleteButton
                            name={service.title}
                            action={deleteServiceAction.bind(null, service.id)}
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

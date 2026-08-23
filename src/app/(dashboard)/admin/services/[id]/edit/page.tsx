import { notFound } from "next/navigation";

import { getServiceByIdAdmin } from "@/features/content/services/service-admin";
import { ServiceForm } from "@/features/content/components/service-form";

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]/edit">) {
  const { id } = await params;
  const service = await getServiceByIdAdmin(id);

  if (!service) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Edit service</h1>
      <div className="mt-6">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}

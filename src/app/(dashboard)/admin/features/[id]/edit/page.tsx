import { notFound } from "next/navigation";

import { getFeatureByIdAdmin } from "@/features/content/services/feature-admin";
import { FeatureForm } from "@/features/content/components/feature-form";

export default async function EditFeaturePage({ params }: PageProps<"/admin/features/[id]/edit">) {
  const { id } = await params;
  const feature = await getFeatureByIdAdmin(id);

  if (!feature) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Edit feature</h1>
      <div className="mt-6">
        <FeatureForm feature={feature} />
      </div>
    </div>
  );
}

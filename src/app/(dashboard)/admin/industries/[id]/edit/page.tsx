import { notFound } from "next/navigation";

import { getIndustryByIdAdmin } from "@/features/content/services/industry-admin";
import { listCategoriesAdmin } from "@/features/catalog/services/category-admin";
import { listServicesAdmin } from "@/features/content/services/service-admin";
import { IndustryForm } from "@/features/content/components/industry-form";

export default async function EditIndustryPage({ params }: PageProps<"/admin/industries/[id]/edit">) {
  const { id } = await params;
  const [industry, categories, services] = await Promise.all([
    getIndustryByIdAdmin(id),
    listCategoriesAdmin(),
    listServicesAdmin(),
  ]);

  if (!industry) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Edit industry</h1>
      <div className="mt-6">
        <IndustryForm
          industry={industry}
          categoryOptions={categories.map((category) => category.name)}
          serviceOptions={services.map((service) => ({ slug: service.slug, title: service.title }))}
        />
      </div>
    </div>
  );
}

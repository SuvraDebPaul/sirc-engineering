import { listCategoriesAdmin } from "@/features/catalog/services/category-admin";
import { listServicesAdmin } from "@/features/content/services/service-admin";
import { IndustryForm } from "@/features/content/components/industry-form";

export default async function NewIndustryPage() {
  const [categories, services] = await Promise.all([listCategoriesAdmin(), listServicesAdmin()]);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add industry</h1>
      <div className="mt-6">
        <IndustryForm
          categoryOptions={categories.map((category) => category.name)}
          serviceOptions={services.map((service) => ({ slug: service.slug, title: service.title }))}
        />
      </div>
    </div>
  );
}

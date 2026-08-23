import { notFound } from "next/navigation";

import { getBrandByIdAdmin } from "@/features/catalog/services/brand-admin";
import { BrandForm } from "@/features/catalog/components/brand-form";

export default async function EditBrandPage({
  params,
}: PageProps<"/admin/brands/[id]/edit">) {
  const { id } = await params;
  const brand = await getBrandByIdAdmin(id);

  if (!brand) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Edit brand</h1>
      <div className="mt-6">
        <BrandForm brand={brand} />
      </div>
    </div>
  );
}

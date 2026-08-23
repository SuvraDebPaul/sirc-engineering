import { notFound } from "next/navigation";

import { getPromotionByIdAdmin } from "@/features/content/services/promotion-admin";
import { PromotionForm } from "@/features/content/components/promotion-form";

export default async function EditPromotionPage({ params }: PageProps<"/admin/promotions/[id]/edit">) {
  const { id } = await params;
  const promotion = await getPromotionByIdAdmin(id);

  if (!promotion) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Edit promotion</h1>
      <div className="mt-6">
        <PromotionForm promotion={promotion} />
      </div>
    </div>
  );
}

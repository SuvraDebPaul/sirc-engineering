import { PromotionForm } from "@/features/content/components/promotion-form";

export default function NewPromotionPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add promotion</h1>
      <div className="mt-6">
        <PromotionForm />
      </div>
    </div>
  );
}

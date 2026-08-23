import { BrandForm } from "@/features/catalog/components/brand-form";

export default function NewBrandPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add brand</h1>
      <div className="mt-6">
        <BrandForm />
      </div>
    </div>
  );
}

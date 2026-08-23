import { FeatureForm } from "@/features/content/components/feature-form";

export default function NewFeaturePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add feature</h1>
      <div className="mt-6">
        <FeatureForm />
      </div>
    </div>
  );
}

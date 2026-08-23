import { ServiceForm } from "@/features/content/components/service-form";

export default function NewServicePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add service</h1>
      <div className="mt-6">
        <ServiceForm />
      </div>
    </div>
  );
}

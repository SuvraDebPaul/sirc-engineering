import { TestimonialForm } from "@/features/content/components/testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add testimonial</h1>
      <div className="mt-6">
        <TestimonialForm />
      </div>
    </div>
  );
}

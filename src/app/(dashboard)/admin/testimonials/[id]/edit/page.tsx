import { notFound } from "next/navigation";

import { getTestimonialByIdAdmin } from "@/features/content/services/testimonial-admin";
import { TestimonialForm } from "@/features/content/components/testimonial-form";

export default async function EditTestimonialPage({
  params,
}: PageProps<"/admin/testimonials/[id]/edit">) {
  const { id } = await params;
  const testimonial = await getTestimonialByIdAdmin(id);

  if (!testimonial) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Edit testimonial</h1>
      <div className="mt-6">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  );
}

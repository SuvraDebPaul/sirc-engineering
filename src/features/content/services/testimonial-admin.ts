import { prisma } from "@/lib/db/prisma";

export async function listTestimonialsAdmin() {
  return prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getTestimonialByIdAdmin(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export interface TestimonialWriteData {
  headline: string;
  quote: string;
  authorName: string;
  authorRole: string;
  company: string;
  sortOrder: number;
  imageUrl: string | null;
}

export async function createTestimonial(data: TestimonialWriteData) {
  return prisma.testimonial.create({ data });
}

export async function updateTestimonial(id: string, data: TestimonialWriteData) {
  return prisma.testimonial.update({ where: { id }, data });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}

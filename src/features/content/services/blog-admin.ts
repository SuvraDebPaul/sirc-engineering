import { prisma } from "@/lib/db/prisma";
import type { BlogPostInput } from "@/features/content/schemas/blog-post.schema";

export async function listBlogPostsAdmin() {
  return prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
}

export async function getBlogPostByIdAdmin(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export interface BlogPostWriteData {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  status: BlogPostInput["status"];
  publishedAt: Date;
  tags: string[];
  blocks: BlogPostInput["blocks"];
  imageUrl: string;
}

export async function createBlogPost(data: BlogPostWriteData) {
  return prisma.blogPost.create({ data });
}

export async function updateBlogPost(id: string, data: BlogPostWriteData) {
  return prisma.blogPost.update({ where: { id }, data });
}

export async function deleteBlogPost(id: string) {
  return prisma.blogPost.delete({ where: { id } });
}

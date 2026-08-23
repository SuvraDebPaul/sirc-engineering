import { notFound } from "next/navigation";

import { getBlogPostByIdAdmin } from "@/features/content/services/blog-admin";
import { BlogPostForm } from "@/features/content/components/blog-post-form";

export default async function EditBlogPostPage({ params }: PageProps<"/admin/blog/[id]/edit">) {
  const { id } = await params;
  const post = await getBlogPostByIdAdmin(id);

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Edit post</h1>
      <div className="mt-6">
        <BlogPostForm post={post} />
      </div>
    </div>
  );
}

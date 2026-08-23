import { BlogPostForm } from "@/features/content/components/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add post</h1>
      <div className="mt-6">
        <BlogPostForm />
      </div>
    </div>
  );
}

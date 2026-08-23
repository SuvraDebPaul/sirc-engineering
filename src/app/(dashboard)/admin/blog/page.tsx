import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";

import { listBlogPostsAdmin } from "@/features/content/services/blog-admin";
import { deleteBlogPostAction } from "@/features/content/actions/delete-blog-post";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";

export default async function AdminBlogPage() {
  const posts = await listBlogPostsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Write and publish articles for the laboratory blog.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="size-4" aria-hidden="true" />
            Add post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No posts yet"
          description="Add your first article to start the blog."
          actions={
            <Button asChild>
              <Link href="/admin/blog/new">Add post</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Post</th>
                    <th className="px-6 py-2 font-medium">Category</th>
                    <th className="px-6 py-2 font-medium">Status</th>
                    <th className="px-6 py-2 font-medium">Published</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="max-w-xs truncate font-medium">{post.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{post.slug}</p>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{post.category}</td>
                      <td className="px-6 py-3">
                        <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                          {post.status === "PUBLISHED" ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {formatDate(post.publishedAt)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/blog/${post.id}/edit`}>Edit</Link>
                          </Button>
                          <ConfirmDeleteButton
                            name={post.title}
                            action={deleteBlogPostAction.bind(null, post.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

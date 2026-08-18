import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Post } from "@/features/content/types";

/**
 * Blog sidebar: recent posts, categories, tags.
 *
 * The reference design also carries a "Recent comments" panel. There is no
 * comment system and no comments, so that panel is absent rather than filled
 * with invented discussion — a fake comment attributed to a fake person is the
 * one thing on a blog that cannot be excused as placeholder styling.
 *
 * Everything here is derived from the posts themselves, so publishing an
 * article updates all three panels without anyone maintaining a second list.
 */
export function BlogSidebar({
  posts,
  activeCategory,
  activeTag,
  className,
}: {
  posts: Post[];
  activeCategory?: string;
  activeTag?: string;
  className?: string;
}) {
  const recent = [...posts]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 4);

  const categories = new Map<string, number>();
  const tags = new Map<string, number>();

  for (const post of posts) {
    categories.set(post.category, (categories.get(post.category) ?? 0) + 1);
    for (const tag of post.tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  }

  const sortedCategories = [...categories.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const sortedTags = [...tags.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <aside className={cn("space-y-6", className)} aria-label="Blog navigation">
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Recent posts</h2>

        <ul className="mt-4 space-y-4">
          {recent.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex gap-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={post.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                </span>

                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                    {post.title}
                  </span>
                  <time
                    dateTime={post.publishedAt}
                    className="mt-1 block text-xs text-muted-foreground"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Categories</h2>

        <ul className="mt-4 space-y-1">
          {sortedCategories.map(([category, count]) => {
            const active = category === activeCategory;

            return (
              <li key={category}>
                <Link
                  href={active ? "/blog" : `/blog?category=${encodeURIComponent(category)}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                    active ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted",
                  )}
                >
                  <span className="min-w-0 truncate">{category}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">({count})</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Tags</h2>

        <ul className="mt-4 flex flex-wrap gap-2">
          {sortedTags.map(([tag]) => {
            const active = tag === activeTag;

            return (
              <li key={tag}>
                <Link
                  href={active ? "/blog" : `/blog?tag=${encodeURIComponent(tag)}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {tag}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

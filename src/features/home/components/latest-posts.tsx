import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";

import { SectionCta } from "@/features/home/components/section-cta";
import { formatDate } from "@/lib/format";
import type { Post } from "@/features/content/types";

/**
 * Latest Engineering Articles & Technical Knowledge Base.
 */
export function LatestPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="blog-heading" className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-xs mb-3">
            <BookOpen className="size-3.5" aria-hidden="true" />
            <span>Technical Knowledge Base</span>
          </div>

          <h2
            id="blog-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight"
          >
            Engineering Insights & Guides
          </h2>

          <p className="mt-2.5 max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground">
            Practical guidance on calibration cycles, ISO compliance standards,
            instrument selection, and field testing best practices.
          </p>
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:ring-1 hover:ring-primary/20 motion-reduce:transform-none"
          >
            {/* Image Header with Scrim */}
            <div className="relative aspect-16/10 overflow-hidden bg-muted border-b border-border/40">
              <Image
                src={post.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
              />

              {/* Category Badge */}
              <span className="absolute top-3 left-3 rounded-full border border-border/60 bg-background/95 px-3 py-1 text-[11px] font-bold text-primary shadow-sm backdrop-blur-md">
                {post.category}
              </span>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              {/* Publication Meta */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2.5">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </span>
                <span aria-hidden="true" className="text-border">
                  •
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                  {post.readMinutes} min read
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold leading-snug text-foreground text-balance">
                <Link
                  href={`/blog/${post.slug}`}
                  className="after:absolute after:inset-0 after:rounded-2xl focus-visible:underline focus-visible:outline-none"
                >
                  <span className="transition-colors duration-200 group-hover:text-primary line-clamp-2">
                    {post.title}
                  </span>
                </Link>
              </h3>

              {/* Excerpt */}
              <p className="mt-2.5 line-clamp-2 flex-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>

              {/* Card Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-xs sm:text-sm font-semibold text-primary">
                <span>Read Full Guide</span>
                <span className="grid size-7 place-items-center rounded-full bg-primary/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <SectionCta
        href="/blog"
        label="Explore All Articles & Knowledge Guides"
      />
    </section>
  );
}

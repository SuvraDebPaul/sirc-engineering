import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import { SectionCta } from "@/features/home/components/section-cta";
import { SectionHeading } from "@/features/home/components/section-heading";
import { formatDate } from "@/lib/format";
import type { Post } from "@/features/content/types";

/**
 * Latest articles.
 *
 * These earn search traffic from engineers looking up calibration intervals
 * and certificate requirements — the same people who eventually need a quote.
 * Titles are questions buyers actually type.
 *
 * Each post is one card with a single stretched link rather than the three
 * separate links to the same URL the previous version used. Three tab stops
 * and three identical announcements per article is noise for anyone using a
 * keyboard or a screen reader; one target the size of the whole card is both
 * easier to hit and quieter to navigate.
 */
export function LatestPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="blog-heading">
      <SectionHeading
        id="blog-heading"
        title="From the laboratory"
        subtitle="Practical guidance on calibration intervals, certificates and specifying instruments that survive industrial use."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 motion-reduce:transform-none"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-muted">
              <Image
                src={post.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
              />

              <span className="absolute top-3 left-3 rounded-full bg-background/95 px-3 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm">
                {post.category}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden="true">·</span>
                <Clock className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                {post.readMinutes} min read
              </p>

              <h3 className="mt-2 text-base leading-snug font-semibold text-balance">
                {/* Stretched link: the whole card is one target, one a11y entry */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="after:absolute after:inset-0 after:rounded-2xl focus-visible:underline focus-visible:outline-none"
                >
                  <span className="transition-colors duration-200 group-hover:text-primary">
                    {post.title}
                  </span>
                </Link>
              </h3>

              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>

              <span className="mt-4 inline-flex items-center justify-between gap-1.5 border-t border-border/60 pt-4 text-sm font-medium text-primary">
                Read article
                <ArrowUpRight
                  className="size-4 transition-transform duration-300 group-hover:rotate-45 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </span>
            </div>
          </article>
        ))}
      </div>

      <SectionCta href="/blog" label="All articles" />
    </section>
  );
}

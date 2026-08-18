import Image from "next/image";
import Link from "next/link";

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
 */
export function LatestPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="blog-heading">
      <SectionHeading
        id="blog-heading"
        align="start"
        title="From the laboratory"
        subtitle="Practical guidance on calibration intervals, certificates and specifying instruments that survive industrial use."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="group flex flex-col">
            <Link
              href={`/blog/${post.slug}`}
              className="relative aspect-16/10 overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={post.imageUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
              />
              <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                {post.category}
              </span>
            </Link>

            <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden="true"> · </span>
              {post.readMinutes} min read
            </p>

            <h3 className="mt-2 text-base font-semibold leading-snug text-balance">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h3>

            <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
              {post.excerpt}
            </p>

            <Link
              href={`/blog/${post.slug}`}
              className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>

      <SectionCta href="/blog" label="All articles" />
    </section>
  );
}

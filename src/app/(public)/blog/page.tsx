import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, User } from "lucide-react";

import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "From the laboratory",
  description:
    "Practical notes on calibration intervals, reading certificates, thermographic surveys and getting measurement right.",
};

/**
 * Blog index — two-column article grid beside a sidebar.
 *
 * Category and tag filters live in the query string, so a filtered view is a
 * real URL and the sidebar stays a server component. No pagination yet: three
 * articles do not need it, and a pager under a single page of results is
 * furniture. It goes in when the count justifies it.
 */
export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const posts = await getPosts();

  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value)?.trim();

  const category = first(params.category);
  const tag = first(params.tag);

  const filtered = posts.filter(
    (post) =>
      (!category || post.category === category) && (!tag || post.tags.includes(tag)),
  );

  const activeFilter = category ?? tag;

  return (
    <>
      <PageHeader
        title="From the laboratory"
        description="Practical notes from the people doing the work — what the standards actually require, and what the certificates actually mean."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <Container className="pb-20">
        <div className="lg:grid lg:grid-cols-[1fr_19rem] lg:gap-10">
          <div className="min-w-0">
            {activeFilter && (
              <div className="mb-6 flex flex-wrap items-center gap-3 border-b pb-4">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "article" : "articles"} in{" "}
                  <span className="font-medium text-foreground">{activeFilter}</span>
                </p>

                <Link
                  href="/blog"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Clear filter
                </Link>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed py-20 text-center">
                <p className="font-medium">Nothing published under {activeFilter} yet</p>
                <Button asChild variant="outline" className="mt-5">
                  <Link href="/blog">All articles</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((post, index) => (
                  <article
                    key={post.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg motion-reduce:transform-none"
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-muted">
                      <Image
                        src={post.imageUrl}
                        alt=""
                        fill
                        priority={index < 2}
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {post.category}
                      </p>

                      <h2 className="mt-2 text-lg font-semibold leading-snug">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="after:absolute after:inset-0 group-hover:text-primary"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <User className="size-3.5" aria-hidden="true" />
                          {post.author}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {post.readMinutes} min
                        </span>
                      </div>

                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>

                      <span className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary">
                        Read more →
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <BlogSidebar
            posts={posts}
            activeCategory={category}
            activeTag={tag}
            className="mt-10 lg:mt-0"
          />
        </div>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MessagesSquare, User } from "lucide-react";

import { BlogSidebar } from "@/features/content/components/blog-sidebar";
import { CommentForm } from "@/features/content/components/comment-form";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import {
  getPostDetail,
  getPosts,
  getRelatedPosts,
} from "@/features/content/services/content";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPostDetail(slug);

  if (!result) return { title: "Article not found" };

  const { post } = result;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: post.imageUrl }],
    },
  };
}

/**
 * Article page — body beside the blog sidebar, then tags, similar posts and
 * the reply form, following the reference layout.
 *
 * The body renders from structured blocks rather than an HTML string, so there
 * is no markdown parser in the bundle and no `dangerouslySetInnerHTML` near
 * editor-supplied content. Adding a block type is a case here, not a package.
 *
 * The reference shows a thread of existing comments. There are none, and none
 * are invented, so that section states the position plainly and hands over to
 * the form.
 */
export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const result = await getPostDetail(slug);

  if (!result) notFound();

  const { post, blocks } = result;
  const [related, posts] = await Promise.all([getRelatedPosts(slug), getPosts()]);

  return (
    <>
      <PageHeader
        title={post.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` },
        ]}
      />

      <Container className="pb-20">
        <div className="lg:grid lg:grid-cols-[1fr_19rem] lg:gap-10">
          <div className="min-w-0">
            <article>
              <div className="relative aspect-16/9 overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={post.imageUrl}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-6 text-xs text-muted-foreground">
                <span className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">
                  {post.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" aria-hidden="true" />
                  {post.author}
                </span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {post.readMinutes} min read
                </span>
              </div>

              <div className="mt-8 space-y-6">
                {blocks.map((block, index) => {
                  switch (block.type) {
                    case "h2":
                      return (
                        <h2 key={index} className="pt-4 text-xl font-semibold tracking-tight">
                          {block.text}
                        </h2>
                      );

                    case "ul":
                      return (
                        <ul key={index} className="ml-5 list-disc space-y-2 text-muted-foreground">
                          {block.items.map((item) => (
                            <li key={item} className="leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      );

                    case "quote":
                      return (
                        <blockquote
                          key={index}
                          className="border-l-4 border-primary bg-muted/40 py-4 pl-5 pr-4 text-base font-medium leading-relaxed"
                        >
                          {block.text}
                        </blockquote>
                      );

                    default:
                      return (
                        <p key={index} className="leading-relaxed text-muted-foreground">
                          {block.text}
                        </p>
                      );
                  }
                })}
              </div>

              {post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-6">
                  <span className="text-sm font-medium">Tags:</span>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </article>

            {related.length > 0 && (
              <section
                className="mt-14 rounded-3xl border border-border/60 bg-linear-to-b from-muted/50 to-muted/20 p-6 sm:p-8"
                aria-labelledby="similar-posts"
              >
                <h2 id="similar-posts" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Similar posts
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {related.slice(0, 2).map((entry) => (
                    <article
                      key={entry.id}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10"
                    >
                      <div className="relative aspect-16/10 bg-muted">
                        <Image
                          src={entry.imageUrl}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 45vw, 100vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="p-5">
                        <h3 className="text-sm font-semibold uppercase leading-snug tracking-wide">
                          <Link
                            href={`/blog/${entry.slug}`}
                            className="after:absolute after:inset-0 group-hover:text-primary"
                          >
                            {entry.title}
                          </Link>
                        </h3>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {entry.author} · {formatDate(entry.publishedAt)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-14" aria-labelledby="comments">
              <h2 id="comments" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <MessagesSquare className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Comments
              </h2>

              <p className="mt-2 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                No comments on this article yet. Be the first — or if you would rather ask us
                directly,{" "}
                <Link href="/rfq?type=other" className="font-medium text-primary hover:underline">
                  send us the question
                </Link>
                .
              </p>

              <div className="mt-8">
                <CommentForm postSlug={post.slug} />
              </div>
            </section>

            <aside className="mt-14 rounded-3xl border border-border/60 bg-linear-to-b from-muted/50 to-muted/20 p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight">
                Questions about your own instruments?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Send us the details and an engineer will tell you what the job actually needs.
              </p>
              <Button asChild size="lg" className="mt-5">
                <Link href="/rfq?type=calibration">Request a quotation</Link>
              </Button>
            </aside>
          </div>

          <BlogSidebar posts={posts} className="mt-10 lg:mt-0" />
        </div>
      </Container>
    </>
  );
}

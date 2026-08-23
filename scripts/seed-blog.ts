/**
 * One-time seed: promotes the old static demo blog posts into the database.
 *
 * Run once, after the blog switched from `@/data` to real `BlogPost` rows,
 * so the admin panel isn't starting from an empty blog. Upserts by slug, so
 * re-running is safe and won't duplicate anything the admin has already
 * created.
 */
import { POSTS } from "@/data/content";
import { POST_BODIES } from "@/data/post-bodies";
import { prisma } from "@/lib/db/prisma";

async function main() {
  let count = 0;

  for (const post of POSTS) {
    const body = POST_BODIES.find((entry) => entry.slug === post.slug);

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        author: post.author,
        imageUrl: post.imageUrl,
        status: "PUBLISHED",
        publishedAt: new Date(post.publishedAt),
        tags: post.tags,
        blocks: body?.blocks ?? [],
      },
    });
    count += 1;
  }

  console.log(`Blog posts: ${count}`);
}

main().then(() => process.exit(0));

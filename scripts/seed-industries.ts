/**
 * One-time seed: promotes the old static demo industries into the database.
 *
 * Run once, after Industries switched from `@/data` to real `Industry` rows,
 * so the admin panel isn't starting from an empty list. Upserts by slug, so
 * re-running is safe and won't duplicate anything the admin has already
 * created.
 */
import { INDUSTRIES } from "@/data/industries";
import { prisma } from "@/lib/db/prisma";

async function main() {
  let count = 0;

  for (const industry of INDUSTRIES) {
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: {},
      create: {
        slug: industry.slug,
        name: industry.name,
        icon: industry.icon,
        imageUrl: industry.imageUrl,
        summary: industry.summary,
        intro: industry.intro,
        needs: industry.needs,
        categoryNames: industry.categoryNames,
        serviceSlugs: industry.serviceIds,
      },
    });
    count += 1;
  }

  console.log(`Industries: ${count}`);
}

main().then(() => process.exit(0));

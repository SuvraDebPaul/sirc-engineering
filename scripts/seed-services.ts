/**
 * One-time seed: promotes the old static demo services into the database.
 *
 * Run once, after Services switched from `@/data` to real `Service` rows, so
 * the admin panel isn't starting from an empty list. Upserts by slug, so
 * re-running is safe and won't duplicate anything the admin has already
 * created.
 */
import { SERVICES } from "@/data/content";
import { SERVICE_DETAILS } from "@/data/service-details";
import { prisma } from "@/lib/db/prisma";

async function main() {
  let count = 0;

  for (const service of SERVICES) {
    const detail = SERVICE_DETAILS.find((entry) => entry.slug === service.id);

    await prisma.service.upsert({
      where: { slug: service.id },
      update: {},
      create: {
        slug: service.id,
        title: service.title,
        description: service.description,
        icon: service.icon,
        imageUrl: service.imageUrl,
        turnaroundDays: service.turnaroundDays,
        onSite: service.onSite,
        overview: detail?.overview ?? [],
        scope: detail?.scope ?? [],
        deliverables: detail?.deliverables ?? [],
        process: detail?.process ?? [],
        faqs: detail?.faqs ?? [],
      },
    });
    count += 1;
  }

  console.log(`Services: ${count}`);
}

main().then(() => process.exit(0));

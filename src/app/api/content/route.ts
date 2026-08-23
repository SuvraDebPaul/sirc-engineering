import { NextResponse } from "next/server";

import { getFeatures, getPosts, getPromotions, getServices, getTestimonials } from "@/features/content/services/content";

/** Marketing content for the home page, for client-side or external consumers. */
export async function GET() {
  return NextResponse.json({
    promotions: await getPromotions(),
    features: await getFeatures(),
    services: await getServices(),
    testimonials: await getTestimonials(),
    posts: await getPosts(),
  });
}

import { NextResponse } from "next/server";

import { FEATURES, POSTS, PROMOTIONS, SERVICES, TESTIMONIALS } from "@/data";

/** Marketing content for the home page, for client-side or external consumers. */
export function GET() {
  return NextResponse.json({
    promotions: PROMOTIONS,
    features: FEATURES,
    services: SERVICES,
    testimonials: TESTIMONIALS,
    posts: POSTS,
  });
}

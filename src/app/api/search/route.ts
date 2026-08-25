import { NextResponse } from "next/server";

import { searchSite } from "@/features/search/services/site-search";

/**
 * Search suggestions endpoint.
 *
 * Feeds the header's type-ahead. Server-rendered pages call `searchSite()`
 * directly — this route exists because the suggestion drop-down is a Client
 * Component and needs a seam it can fetch from as the visitor types.
 *
 * An empty or one-character query returns nothing rather than the whole
 * catalogue: a single letter matches most of it, so the drop-down would be
 * noise and the work wasted.
 */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json({ products: [], services: [], total: 0 });
  }

  return NextResponse.json(await searchSite(query));
}

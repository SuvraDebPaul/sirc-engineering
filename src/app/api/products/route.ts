import { NextResponse } from "next/server";

import { getProducts } from "@/features/catalog/services";

/**
 * Products endpoint.
 *
 * The seam Client Components use to reach the catalogue — server-rendered
 * pages call `getProducts()` directly instead of self-fetching this route.
 */
export async function GET() {
  return NextResponse.json(await getProducts());
}

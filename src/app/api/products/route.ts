import { NextResponse } from "next/server";

import { PRODUCTS } from "@/data";

/**
 * Products endpoint.
 *
 * The seam between the site and its data source. Right now it returns the demo
 * records from `src/data`; swap the body for a database query and every page
 * keeps working unchanged.
 */
export function GET() {
  return NextResponse.json(PRODUCTS);
}

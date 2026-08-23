import { NextResponse } from "next/server";

import { getBrands } from "@/features/catalog/services";

export async function GET() {
  return NextResponse.json(await getBrands());
}

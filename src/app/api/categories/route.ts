import { NextResponse } from "next/server";

import { getCategories } from "@/features/catalog/services";

export async function GET() {
  return NextResponse.json(await getCategories());
}

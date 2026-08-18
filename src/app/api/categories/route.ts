import { NextResponse } from "next/server";

import { CATEGORIES } from "@/data";

export function GET() {
  return NextResponse.json(CATEGORIES);
}

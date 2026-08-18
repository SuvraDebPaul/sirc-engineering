import { NextResponse } from "next/server";

import { BRANDS } from "@/data";

export function GET() {
  return NextResponse.json(BRANDS);
}

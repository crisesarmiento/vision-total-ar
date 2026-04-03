import { NextResponse } from "next/server";
import { getTickerItems } from "@/lib/rss";

export async function GET() {
  const data = await getTickerItems();
  return NextResponse.json(data);
}

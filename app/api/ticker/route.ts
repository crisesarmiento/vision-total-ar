import { NextResponse } from "next/server";
import { checkRequestRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getTickerItems } from "@/lib/rss";

// RSS fetch is Node.js only; maxDuration covers external feed latency.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const tickerRateLimit = {
  id: "api-ticker",
  limit: 20,
  windowMs: 60_000,
};

export async function GET(request: Request) {
  const rateLimit = checkRequestRateLimit(request, tickerRateLimit);

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const data = await getTickerItems();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/ticker] getTickerItems failed", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

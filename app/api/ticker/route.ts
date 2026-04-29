import { NextResponse } from "next/server";
import { checkRequestRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getTickerItems } from "@/lib/rss";

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

  const data = await getTickerItems();
  return NextResponse.json(data);
}

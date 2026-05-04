import { NextResponse } from "next/server";
import { checkRequestRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getLiveSnapshots } from "@/lib/youtube";

// Prisma + quota_usage DB writes are incompatible with edge runtime.
// maxDuration accommodates YouTube Data API v3 latency across up to 3 tiers.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const liveRateLimit = {
  id: "api-live",
  limit: 30,
  windowMs: 60_000,
};

export async function GET(request: Request) {
  const rateLimit = checkRequestRateLimit(request, liveRateLimit);

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const data = await getLiveSnapshots();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/live] getLiveSnapshots failed", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

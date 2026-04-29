import { NextResponse } from "next/server";
import { checkRequestRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getLiveSnapshots } from "@/lib/youtube";

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

  const data = await getLiveSnapshots();
  return NextResponse.json(data);
}

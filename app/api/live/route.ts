import { NextResponse } from "next/server";
import { getLiveSnapshots } from "@/lib/youtube";

export async function GET() {
  const data = await getLiveSnapshots();
  return NextResponse.json(data);
}

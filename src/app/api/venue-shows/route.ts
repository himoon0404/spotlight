import { NextRequest, NextResponse } from "next/server";
import { fetchShowsByVenue } from "@/lib/kopis";

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) return NextResponse.json([]);

  const venueId = req.nextUrl.searchParams.get("venue");
  if (!venueId) return NextResponse.json([]);

  const shows = await fetchShowsByVenue(apiKey, venueId);

  return NextResponse.json(shows, {
    headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400" },
  });
}

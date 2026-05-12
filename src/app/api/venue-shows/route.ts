import { NextRequest, NextResponse } from "next/server";
import { fetchShowsByVenue, fetchShowsByVenueName } from "@/lib/kopis";

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) return NextResponse.json([]);

  const venueId   = req.nextUrl.searchParams.get("venue")      ?? "";
  const venueName = req.nextUrl.searchParams.get("venueName")  ?? "";

  if (!venueId && !venueName) return NextResponse.json([]);

  const shows = venueId
    ? await fetchShowsByVenue(apiKey, venueId)
    : await fetchShowsByVenueName(apiKey, venueName);

  return NextResponse.json(shows, {
    headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400" },
  });
}

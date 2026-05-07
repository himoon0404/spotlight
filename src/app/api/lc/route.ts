import { NextRequest, NextResponse } from "next/server";
import { fetchPersonalizedLC, AREA_CODE } from "@/lib/kopis";
import { SUB_REGION_LOOKUP } from "@/lib/regions";

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) return NextResponse.json({ shows: [], priority: 4, label: "전국" });

  const area        = req.nextUrl.searchParams.get("area")      ?? "서울";
  const subArea     = req.nextUrl.searchParams.get("subArea")   ?? "";
  const venueId     = req.nextUrl.searchParams.get("venue")     ?? undefined;
  const venueName   = req.nextUrl.searchParams.get("venueName") ?? "";
  const genresRaw   = req.nextUrl.searchParams.get("genres")    ?? "";
  const genres      = genresRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const subAreaCode = subArea ? (SUB_REGION_LOOKUP[subArea]?.subCode ?? "") : "";

  const result = await fetchPersonalizedLC(apiKey, {
    areaCode: AREA_CODE[area] ?? "11",
    subAreaCode,
    venueId,
    venueName,
    areaName: subArea ? `${subArea}·${area}` : area,
    genres,
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400" },
  });
}

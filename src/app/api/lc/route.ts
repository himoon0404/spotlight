import { NextRequest, NextResponse } from "next/server";
import { fetchPersonalizedLC } from "@/lib/kopis";

const AREA_CODE: Record<string, string> = {
  서울: "11", 경기: "41", 부산: "26", 대구: "27",
  인천: "28", 광주: "29", 대전: "30", 울산: "31",
};

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) return NextResponse.json({ shows: [], priority: 4, label: "전국" });

  const area      = req.nextUrl.searchParams.get("area")      ?? "서울";
  const venueId   = req.nextUrl.searchParams.get("venue")     ?? undefined;
  const venueName = req.nextUrl.searchParams.get("venueName") ?? "";
  const genresRaw = req.nextUrl.searchParams.get("genres")    ?? "";
  const genres    = genresRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const result = await fetchPersonalizedLC(apiKey, {
    areaCode: AREA_CODE[area] ?? "11",
    venueId,
    venueName,
    areaName: area,
    genres,
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400" },
  });
}

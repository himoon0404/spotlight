import { NextRequest, NextResponse } from "next/server";
import { fetchVenues } from "@/lib/kopis";

const AREA_CODE: Record<string, string> = {
  서울: "11", 경기: "41", 부산: "26", 대구: "27",
  인천: "28", 광주: "29", 대전: "30", 울산: "31",
};

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) return NextResponse.json([]);

  const area = req.nextUrl.searchParams.get("area") ?? "서울";
  const areaCode = AREA_CODE[area] ?? "11";
  const venues = await fetchVenues(apiKey, areaCode);

  return NextResponse.json(venues, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800" },
  });
}

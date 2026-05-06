import { type NextRequest, NextResponse } from "next/server";
import { fetchShows } from "@/lib/kopis";
import { MOCK_SHOWS, MOCK_SHOWS_FULL } from "@/lib/mockData";

// KOPIS area codes
const AREA_CODE: Record<string, string> = {
  서울: "11",
  경기: "41",
  부산: "26",
  대구: "27",
  인천: "28",
  광주: "29",
  대전: "30",
  울산: "31",
};

export async function GET(req: NextRequest) {
  const area    = req.nextUrl.searchParams.get("area") ?? "서울";
  const areaCode = AREA_CODE[area] ?? "11";
  const full    = req.nextUrl.searchParams.get("full") === "true";
  const genres  = req.nextUrl.searchParams.get("genres")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const apiKey  = process.env.KOPIS_API_KEY;

  // No API key → serve mock immediately
  if (!apiKey) {
    const mock = full ? MOCK_SHOWS_FULL : MOCK_SHOWS;
    return NextResponse.json(
      { ...mock, isMock: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const data = await fetchShows(apiKey, areaCode, full, genres);

    const fallback = full ? MOCK_SHOWS_FULL : MOCK_SHOWS;
    return NextResponse.json(
      {
        popular:    data.popular.length    ? data.popular    : fallback.popular,
        lastChance: data.lastChance.length ? data.lastChance : fallback.lastChance,
        hidden:     data.hidden.length     ? data.hidden     : fallback.hidden,
        nearby:     data.nearby,
        isMock: false,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("[kopis]", err instanceof Error ? err.message : err);
    const mock = full ? MOCK_SHOWS_FULL : MOCK_SHOWS;
    return NextResponse.json({ ...mock, isMock: true });
  }
}

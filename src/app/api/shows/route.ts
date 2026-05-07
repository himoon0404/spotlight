import { type NextRequest, NextResponse } from "next/server";
import { fetchShows, AREA_CODE } from "@/lib/kopis";
import { SUB_REGION_LOOKUP } from "@/lib/regions";

export async function GET(req: NextRequest) {
  const area        = req.nextUrl.searchParams.get("area") ?? "";
  const subArea     = req.nextUrl.searchParams.get("subArea") ?? "";
  const areaCode    = area ? (AREA_CODE[area] ?? "") : "";
  const subAreaCode = subArea ? (SUB_REGION_LOOKUP[subArea]?.subCode ?? "") : "";
  const full        = req.nextUrl.searchParams.get("full") === "true";
  const genres      = req.nextUrl.searchParams.get("genres")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const apiKey      = process.env.KOPIS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "KOPIS API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const data = await fetchShows(apiKey, areaCode, subAreaCode, full, genres);

    return NextResponse.json(
      {
        popular:    data.popular,
        lastChance: data.lastChance,
        hidden:     data.hidden,
        nearby:     data.nearby,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("[kopis]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "공연 데이터를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}

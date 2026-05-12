import { NextRequest, NextResponse } from "next/server";

const BASE = "https://www.kopis.or.kr/openApi/restful";

const AREA_CODE: Record<string, string> = {
  서울: "11", 인천: "28", 경기: "41", 강원: "42",
  충북: "43", 충남: "44", 세종: "36", 대전: "30",
  전북: "45", 전남: "46", 광주: "29",
  경북: "47", 대구: "27", 경남: "48", 부산: "26", 울산: "31",
  제주: "50",
};

function tag(xml: string, name: string): string {
  const re = new RegExp(`<${name}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${name}>`, "i");
  const m = xml.match(re);
  if (!m) return "";
  return (m[1] ?? m[2] ?? "").trim();
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) {
    console.error("[/api/venues] KOPIS_API_KEY not set");
    return NextResponse.json([]);
  }

  const area = req.nextUrl.searchParams.get("area") ?? "서울";
  const areaCode = AREA_CODE[area] ?? "11";

  const url = new URL(`${BASE}/prfplc`);
  url.searchParams.set("service", apiKey);
  url.searchParams.set("cpage", "1");
  url.searchParams.set("rows", "100");
  url.searchParams.set("signgucode", areaCode);

  console.log("[/api/venues] area=%s code=%s url=%s", area, areaCode, url.toString().replace(apiKey, "***"));

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const xml = await res.text();
    console.log("[/api/venues] status=%d xml_length=%d xml_preview=%s", res.status, xml.length, xml.slice(0, 300));

    const dbBlocks = Array.from(xml.matchAll(/<db>([\s\S]*?)<\/db>/g)).map((m) => m[1]);
    console.log("[/api/venues] db_blocks=%d", dbBlocks.length);

    const venues = dbBlocks
      .map((b) => ({
        id: tag(b, "mt10id"),
        name: tag(b, "fcltynm") || tag(b, "fcltyNm"),
        area: tag(b, "sidonm"),
        district: tag(b, "gugunnm"),
        seats: Number(tag(b, "seatscale")) || 0,
      }))
      .filter((v) => v.id && v.name);

    console.log("[/api/venues] venues_after_filter=%d", venues.length);
    return NextResponse.json(venues, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (err) {
    console.error("[/api/venues] error:", err);
    return NextResponse.json([]);
  }
}

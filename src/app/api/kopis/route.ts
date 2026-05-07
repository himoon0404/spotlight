/**
 * /api/kopis — KOPIS 공연목록 API 서버 프록시
 *
 * 브라우저에서 KOPIS를 직접 호출하면 CORS로 차단됩니다.
 * 이 라우트가 서버에서 KOPIS를 대신 호출하고 JSON으로 변환합니다.
 * API 키는 process.env.KOPIS_API_KEY 로만 읽습니다. (브라우저에 노출 안 됨)
 *
 * 사용 예시: GET /api/kopis?region=서울
 */

import { NextRequest, NextResponse } from "next/server";
import { SUB_REGION_LOOKUP } from "@/lib/regions";

const KOPIS_BASE = "https://www.kopis.or.kr/openApi/restful";

const GENRE_SHCATE: Record<string, string> = {
  "연극":    "AAAA",
  "뮤지컬":  "GGGA",
  "클래식":  "CCCA",
  "전통예술":"CCCC",
  "재즈":    "CCCD",
  "인디음악":"CCCD",
  "무용":    "BBBE",
};

// 지역명 (단·장명 모두) → KOPIS signgucode
const REGION_CODE: Record<string, string> = {
  // 특별시
  "서울": "11", "서울특별시": "11",
  // 광역시
  "부산": "26", "부산광역시": "26",
  "대구": "27", "대구광역시": "27",
  "인천": "28", "인천광역시": "28",
  "광주": "29", "광주광역시": "29",
  "대전": "30", "대전광역시": "30",
  "울산": "31", "울산광역시": "31",
  // 특별자치시
  "세종": "36", "세종특별자치시": "36",
  // 도
  "경기": "41", "경기도": "41",
  "강원": "42", "강원도": "42", "강원특별자치도": "42",
  "충북": "43", "충청북도": "43",
  "충남": "44", "충청남도": "44",
  "전북": "45", "전라북도": "45", "전북특별자치도": "45",
  "전남": "46", "전라남도": "46",
  "경북": "47", "경상북도": "47",
  "경남": "48", "경상남도": "48",
  // 특별자치도
  "제주": "50", "제주도": "50", "제주특별자치도": "50",
};

// ─── 날짜 헬퍼 ────────────────────────────────────────────────────────────────

function toKopisDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function today(): string {
  return toKopisDate(new Date());
}

function threeMonthsLater(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return toKopisDate(d);
}

// ─── XML 파싱 헬퍼 ────────────────────────────────────────────────────────────
// NOTE: DOMParser는 브라우저 전용 — 서버(Node.js)에서는 정규식으로 대체합니다.

function validKopisPoster(raw: string): string | null {
  const url = raw.replace(/^http:/, "https:");
  try {
    const u = new URL(url);
    return u.hostname === "www.kopis.or.kr" && u.pathname.startsWith("/upload/pfm") ? url : null;
  } catch { return null; }
}

function extractTag(xml: string, tagName: string): string {
  const pattern = new RegExp(
    `<${tagName}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*?))</${tagName}>`,
    "i"
  );
  const m = xml.match(pattern);
  return (m?.[1] ?? m?.[2] ?? "").trim();
}

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "NO_KEY", items: [] });
  }

  // ── Single performance detail (poster enrichment) ──────────────────────────
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (id) {
    try {
      const url = new URL(`${KOPIS_BASE}/pblprfr/${encodeURIComponent(id)}`);
      url.searchParams.set("service", apiKey);
      const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
      const xml = await res.text();
      const poster = validKopisPoster(extractTag(xml, "poster"));
      return NextResponse.json({ poster });
    } catch {
      return NextResponse.json({ poster: null });
    }
  }

  const region    = req.nextUrl.searchParams.get("region") ?? "";
  const subRegion = req.nextUrl.searchParams.get("subRegion") ?? "";
  const code      = REGION_CODE[region] ?? "";
  const subCode   = subRegion ? (SUB_REGION_LOOKUP[subRegion]?.subCode ?? "") : "";
  const genre     = req.nextUrl.searchParams.get("genre") ?? "";
  const shcate    = GENRE_SHCATE[genre] ?? "";

  const url = new URL(`${KOPIS_BASE}/pblprfr`);
  url.searchParams.set("service", apiKey);
  url.searchParams.set("stdate",  today());
  url.searchParams.set("eddate",  threeMonthsLater());
  url.searchParams.set("rows",    "50");
  url.searchParams.set("cpage",   "1");
  // prfstate 제거 — 예정/공연중 모두 조회
  if (code)    url.searchParams.set("signgucode",    code);
  if (subCode) url.searchParams.set("signgucodesub", subCode);
  if (shcate)  url.searchParams.set("shcate",        shcate);

  console.log("[/api/kopis] region=%s subRegion=%s code=%s url=%s", region, subRegion, code, url.toString());

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 1800 },
    });

    const xmlText = await res.text();
    console.log("[/api/kopis] xml length=%d", xmlText.length);

    const blocks = xmlText.match(/<db>[\s\S]*?<\/db>/g) ?? [];

    const items = blocks.map((block) => ({
      id:        extractTag(block, "mt20id"),
      title:     extractTag(block, "prfnm"),
      place:     extractTag(block, "fcltynm"),
      startDate: extractTag(block, "prfpdfrom"),
      endDate:   extractTag(block, "prfpdto"),
      poster:    validKopisPoster(extractTag(block, "poster")),
      genre:     extractTag(block, "genrenm"),
      state:     extractTag(block, "prfstate"),
      region,
    }));

    console.log("[/api/kopis] items=%d", items.length);
    return NextResponse.json({ items });

  } catch (err) {
    console.error("[/api/kopis] fetch error:", err);
    return NextResponse.json(
      { error: "FETCH_ERROR", items: [] },
      { status: 500 }
    );
  }
}

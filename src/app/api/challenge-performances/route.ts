import { NextRequest, NextResponse } from "next/server";

const KOPIS_BASE = "http://kopis.or.kr/openApi/restful";
const POSTER_RE = /^https?:\/\/www\.kopis\.or\.kr\/upload\/pfm/;

const AREA_CODE: Record<string, string> = {
  서울: "11", 부산: "26", 대구: "27", 인천: "28",
  광주: "29", 대전: "30", 울산: "31", 세종: "36",
  경기: "41", 강원: "42", 충북: "43", 충남: "44",
  전북: "45", 전남: "46", 경북: "47", 경남: "48", 제주: "50",
};

// 장르별 발견 가치 점수 (높을수록 덜 알려진 공연)
const GENRE_SCORE: Record<string, number> = {
  재즈: 5, 서커스: 5, 마술: 5, 무용: 4, 국악: 4,
  연극: 3, 클래식: 2, 오페라: 2, 복합: 2, 뮤지컬: 1,
};

function dateStr(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function parseXmlList(xml: string) {
  const items: {
    id: string; title: string; place: string;
    startDate: string; endDate: string; poster: string | null;
    genre: string; state: string; region: string; discoveryScore: number;
  }[] = [];

  for (const [, block] of xml.matchAll(/<db>([\s\S]*?)<\/db>/g)) {
    const g = (tag: string) =>
      block.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1] ??
      block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1] ?? "";

    const poster = g("poster");
    const genre = g("genrenm");

    const genreKey = Object.keys(GENRE_SCORE).find((k) => genre.includes(k)) ?? "";
    const genreScore = GENRE_SCORE[genreKey] ?? 2;
    const posterScore = POSTER_RE.test(poster) ? 0 : 1; // 포스터 없음 = 덜 홍보된 공연

    items.push({
      id: g("mt20id"),
      title: g("prfnm"),
      place: g("fcltynm"),
      startDate: g("prfpdfrom"),
      endDate: g("prfpdto"),
      poster: POSTER_RE.test(poster) ? poster : null,
      genre,
      state: g("prfstate"),
      region: g("area"),
      discoveryScore: genreScore + posterScore,
    });
  }
  return items;
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no api key" }, { status: 500 });

  const { searchParams } = req.nextUrl;
  const region = searchParams.get("region") ?? "서울";
  const type = searchParams.get("type") ?? "current"; // "current" | "next"

  const now = new Date();
  let stdate: string, eddate: string, prfstate: string;

  if (type === "next") {
    const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    stdate = dateStr(first);
    eddate = dateStr(last);
    prfstate = "01"; // 공연예정
  } else {
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    stdate = dateStr(now);
    eddate = dateStr(last);
    prfstate = "02"; // 공연중
  }

  const areaCode = region === "전체" ? "" : (AREA_CODE[region] ?? "");

  const params = new URLSearchParams({
    service: apiKey,
    stdate,
    eddate,
    cpage: "1",
    rows: "100",
    prfstate,
  });
  if (areaCode) params.set("signgucode", areaCode);

  try {
    const res = await fetch(`${KOPIS_BASE}/pblprfr?${params}`, {
      next: { revalidate: 1800 },
    });
    const xml = await res.text();
    const items = parseXmlList(xml);

    // 발견 가치 점수 내림차순 정렬
    items.sort((a, b) => b.discoveryScore - a.discoveryScore);

    return NextResponse.json(items, {
      headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}

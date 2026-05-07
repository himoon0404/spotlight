/**
 * kopisRegion.ts — 지역별 공연 데이터 조회
 *
 * API 키는 서버(src/app/api/kopis/route.ts)에서만 읽습니다.
 * 이 파일은 /api/kopis 로컬 엔드포인트를 호출합니다.
 */

import type { SearchShow } from "@/types/show";

// ─── 공개 인터페이스 ───────────────────────────────────────────────────────────

export interface Performance {
  id:        string;
  title:     string;
  place:     string;
  startDate: string;
  endDate:   string;
  poster:    string;
  genre:     string;
  state:     string;
  region?:   string;
  x?:        number;
  y?:        number;
}

export interface MapMarker {
  region:       string;
  x:            number;
  y:            number;
  count:        number;
  performances: Performance[];
}

// ─── 지역 코드 참조표 ─────────────────────────────────────────────────────────

export const REGION_CODE_MAP: Record<string, string> = {
  서울: "11", 부산: "26", 대구: "27", 인천: "28",
  광주: "29", 대전: "30", 울산: "31", 세종: "36",
  경기: "41", 강원: "42", 충북: "43", 충남: "44",
  전북: "45", 전남: "46", 경북: "47", 경남: "48",
  제주: "50",
};

// ─── KOPIS API 응답 타입 ──────────────────────────────────────────────────────

export interface KopisItem {
  id:        string;
  title:     string;
  place:     string;
  startDate: string;
  endDate:   string;
  poster:    string;
  genre:     string;
  state:     string;
  region:    string;
}

// ─── 내부 변환 헬퍼 ───────────────────────────────────────────────────────────

function calcDday(endDate: string) {
  const end = new Date(endDate.replace(/\./g, "-"));
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  return {
    dday:       diff,
    ddayLabel:  diff === 0 ? "D-day" : `D-${diff}`,
    isCritical: diff === 0,
  };
}

function themeFor(genre: string): string {
  if (genre.includes("뮤지컬"))                              return "amber";
  if (genre.includes("연극"))                               return "red";
  if (genre.includes("무용") || genre.includes("발레"))     return "purple";
  if (genre.includes("국악") || genre.includes("전통"))     return "emerald";
  if (genre.includes("재즈"))                               return "teal";
  return "blue";
}

function genreKey(genre: string): string {
  if (genre.includes("뮤지컬"))                                                return "뮤지컬";
  if (genre.includes("연극"))                                                  return "연극";
  if (genre.includes("재즈"))                                                  return "재즈";
  if (genre.includes("클래식") || genre.includes("교향") || genre.includes("오페라")) return "클래식";
  if (genre.includes("무용") || genre.includes("발레"))                        return "무용";
  if (genre.includes("국악") || genre.includes("전통"))                        return "전통예술";
  return "인디음악";
}

function kopisToSearchShow(item: KopisItem): SearchShow {
  const d = calcDday(item.endDate);
  const posterUrl = item.poster ? item.poster.replace(/^http:/, "https:") : undefined;
  return {
    id:           item.id,
    venueId:      item.id,
    title:        item.title,
    venue:        item.place,
    region:       item.region,
    area:         item.region,
    genre:        genreKey(item.genre),
    subGenre:     item.genre,
    period:       `${item.startDate} – ${item.endDate}`,
    dday:         d?.dday,
    ddayLabel:    d?.ddayLabel,
    isCritical:   d?.isCritical,
    isLastChance: d ? d.dday <= 3 : false,
    theme:        themeFor(item.genre),
    isHidden:     false,
    hasEvent:     false,
    price:        0,
    reviewCount:  0,
    poster:       posterUrl,
    posterUrl:    posterUrl,
  };
}

function kopisToPerformance(item: KopisItem): Performance {
  return {
    id:        item.id,
    title:     item.title,
    place:     item.place,
    startDate: item.startDate,
    endDate:   item.endDate,
    poster:    item.poster,
    genre:     item.genre,
    state:     item.state,
    region:    item.region,
  };
}

// ─── 포스터 보강 ──────────────────────────────────────────────────────────────

async function enrichMissingPosters(items: KopisItem[]): Promise<KopisItem[]> {
  const missing = items.filter((item) => !item.poster && item.id && /^PF\d/.test(item.id));
  if (missing.length === 0) return items;

  const results = await Promise.allSettled(
    missing.map(async (item) => {
      const res = await fetch(`/api/kopis?id=${encodeURIComponent(item.id)}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { poster?: string | null };
      return data.poster ? { id: item.id, poster: data.poster } : null;
    })
  );

  const posterMap = new Map<string, string>();
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      posterMap.set(r.value.id, r.value.poster);
    }
  }

  if (posterMap.size === 0) return items;
  return items.map((item) =>
    posterMap.has(item.id) ? { ...item, poster: posterMap.get(item.id)! } : item
  );
}

// ─── 공개 API 함수 ────────────────────────────────────────────────────────────

/** 전국 공연 목록 조회 */
export async function getPerformances(): Promise<SearchShow[]> {
  try {
    const res = await fetch("/api/kopis");
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: KopisItem[]; error?: string };
    if (data.error || !data.items || data.items.length === 0) return [];
    const enriched = await enrichMissingPosters(data.items);
    return enriched.map(kopisToSearchShow);
  } catch {
    return [];
  }
}

/** 지역별 공연 조회 */
export async function getPerformancesByRegion(region: string): Promise<SearchShow[]> {
  if (!REGION_CODE_MAP[region]) {
    console.warn("[kopisRegion] 알 수 없는 지역:", region);
    return [];
  }

  try {
    const res = await fetch(`/api/kopis?region=${encodeURIComponent(region)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: KopisItem[]; error?: string };
    if (data.error || !data.items || data.items.length === 0) return [];
    const enriched = await enrichMissingPosters(data.items);
    return enriched.map(kopisToSearchShow);
  } catch {
    return [];
  }
}

/** 지역별 공연 조회 — Performance[] 형태 (MapMarker 구성용) */
export async function getPerformancesByRegionRaw(region: string): Promise<Performance[]> {
  if (!REGION_CODE_MAP[region]) return [];

  try {
    const res = await fetch(`/api/kopis?region=${encodeURIComponent(region)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: KopisItem[]; error?: string };
    if (data.error || !data.items || data.items.length === 0) return [];
    return data.items.map(kopisToPerformance);
  } catch {
    return [];
  }
}

/** 마감 임박 공연 조회 */
export async function getLastChancePerformances(region?: string): Promise<SearchShow[]> {
  const all = region
    ? await getPerformancesByRegion(region)
    : await getPerformances();
  return all.filter((s) => s.isLastChance || (s.dday !== undefined && s.dday <= 3));
}

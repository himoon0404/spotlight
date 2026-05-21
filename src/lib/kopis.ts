import type { ProcessedShow, ShowTheme, ShowsPayload } from "@/types/show";

// ─── Poster validation ───────────────────────────────────────────────────────
// Only accept poster URLs served directly by KOPIS CDN.
// Any other URL (external search result, placeholder service, etc.) is rejected.
function isValidKopisPoster(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname === "www.kopis.or.kr" && u.pathname.startsWith("/upload/pfm");
  } catch {
    return false;
  }
}

// ─── XML ─────────────────────────────────────────────────────────────────────

function tag(xml: string, name: string): string {
  const re = new RegExp(
    `<${name}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${name}>`,
    "i"
  );
  const m = xml.match(re);
  if (!m) return "";
  return (m[1] ?? m[2] ?? "")
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function blocks(xml: string, wrapper: string): string[] {
  return Array.from(
    xml.matchAll(new RegExp(`<${wrapper}>([\\s\\S]*?)<\\/${wrapper}>`, "g"))
  ).map((m) => m[1]);
}

// ─── Date ─────────────────────────────────────────────────────────────────────

export function dateToKopis(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function kopisToDate(s: string): Date | null {
  if (!s) return null;
  const parts = s.split(".");
  if (parts.length < 3) return null;
  return new Date(+parts[0], +parts[1] - 1, +parts[2]);
}

function calcDday(endStr: string): {
  label: string;
  value: number;
  isCritical: boolean;
} | null {
  const end = kopisToDate(endStr);
  if (!end) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.round((end.getTime() - now.getTime()) / 86_400_000);
  if (diff < 0) return null;
  return {
    label: diff === 0 ? "D-DAY" : `D-${diff}`,
    value: diff,
    isCritical: diff <= 1,
  };
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

const GENRE_THEME: [RegExp, ShowTheme][] = [
  [/뮤지컬/, "amber"],
  [/재즈|블루스/, "teal"],
  [/무용|발레/, "purple"],
  [/클래식|오페라|서양음악|한국음악|국악/, "blue"],
  [/연극/, "red"],
  [/어린이/, "emerald"],
];

function themeFor(genre: string): ShowTheme {
  for (const [re, t] of GENRE_THEME) if (re.test(genre)) return t;
  return "emerald";
}

const DDAY_COPY: Record<number, string> = {
  0: "오늘이 마지막 공연",
  1: "지금 아니면 끝",
  2: "이번 주 마지막 기회",
  3: "이번 주 마지막 공연",
};

const RECOMMEND: [RegExp, string][] = [
  [/무용|발레/, "신인 아티스트 주목"],
  [/재즈/, "평점 높고 관객 수 적은 공연"],
  [/클래식|오페라/, "소규모 공연 · 한정 좌석"],
  [/국악/, "전통 공연 · 비주류 명작"],
  [/연극/, "평점 대비 저평가 공연"],
];

function recommendFor(genre: string): string {
  for (const [re, r] of RECOMMEND) if (re.test(genre)) return r;
  return "큐레이터 PICK · 숨은 명작";
}

// ─── Parse ───────────────────────────────────────────────────────────────────

interface ShowBlock {
  id: string;
  title: string;
  from: string;
  to: string;
  venue: string;
  poster: string;
  area: string;
  running: string;
  genre: string;
}

function parseBlock(b: string): ShowBlock {
  return {
    id: tag(b, "mt20id"),
    title: tag(b, "prfnm"),
    from: tag(b, "prfpdfrom"),
    to: tag(b, "prfpdto"),
    venue: tag(b, "fcltynm"),
    poster: (() => { const u = tag(b, "poster").replace(/^http:/, "https:"); return isValidKopisPoster(u) ? u : ""; })(),
    area: tag(b, "area"),
    running: tag(b, "prfruntime"),
    genre: tag(b, "genrenm"),
  };
}

function toProcessed(
  s: ShowBlock,
  overrides: Partial<ProcessedShow> = {}
): ProcessedShow {
  const d = calcDday(s.to);
  return {
    id: s.id,
    title: s.title,
    venue: s.venue,
    period: `${s.from} – ${s.to}`,
    genre: s.genre || "기타",
    running: s.running || undefined,
    posterUrl: s.poster || undefined,
    area: s.area,
    theme: themeFor(s.genre),
    dday: d?.value,
    ddayLabel: d?.label,
    isCritical: d?.isCritical,
    ...overrides,
  };
}

const CHILDREN_VENUE_RE = /아이들극장|어린이극장|어린이회관|어린이문화관|어린이센터|어린이아트홀|어린이극단/;
const notChildrenShow = (s: ShowBlock) =>
  !/어린이/.test(s.genre) && !CHILDREN_VENUE_RE.test(s.venue);

// ─── Fetch ────────────────────────────────────────────────────────────────────

const BASE = "https://www.kopis.or.kr/openApi/restful";

async function kFetch(
  path: string,
  params: Record<string, string>,
  timeoutMs = 8_000
): Promise<string> {
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: 1_800 },
  });
  if (!res.ok) throw new Error(`KOPIS /${path} → ${res.status}`);
  return res.text();
}

// ─── Poster enrichment ────────────────────────────────────────────────────────
// For shows missing a poster URL, attempt to retrieve it from the KOPIS detail API.
// Runs in parallel; individual failures are silently skipped.

async function enrichPosters(
  apiKey: string,
  shows: ProcessedShow[]
): Promise<ProcessedShow[]> {
  const missing = shows.filter(
    (s) => !s.posterUrl && s.id && /^PF\d/.test(s.id)
  );
  if (missing.length === 0) return shows;

  const results = await Promise.allSettled(
    missing.map(async (s) => {
      const xml = await kFetch(`pblprfr/${s.id}`, { service: apiKey }, 4_000);
      const raw = tag(xml, "poster").replace(/^http:/, "https:");
      const poster = isValidKopisPoster(raw) ? raw : "";
      return { id: s.id, poster };
    })
  );

  const posterMap = new Map<string, string>();
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.poster) {
      posterMap.set(r.value.id, r.value.poster);
    }
  }

  if (posterMap.size === 0) return shows;
  return shows.map((s) =>
    posterMap.has(s.id) ? { ...s, posterUrl: posterMap.get(s.id) } : s
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

// Area name → KOPIS area code (used in API requests)
export const AREA_CODE: Record<string, string> = {
  서울: "11", 인천: "28", 경기: "41", 강원: "42",
  충북: "43", 충남: "44", 세종: "36", 대전: "30",
  전북: "45", 전남: "46", 광주: "29",
  경북: "47", 대구: "27", 경남: "48", 부산: "26", 울산: "31",
  제주: "50",
};

// KOPIS area codes → keyword that appears in the <area> tag of responses.
// Used to post-filter results because KOPIS sometimes returns off-region shows.
// Primary keyword matches the full official name (e.g. "전라남도" → "전라남").
const AREA_KEYWORD: Record<string, string> = {
  "11": "서울",   "28": "인천",   "41": "경기",   "42": "강원",
  "43": "충청북", "44": "충청남", "36": "세종",   "30": "대전",
  "45": "전라북", "46": "전라남", "29": "광주",
  "47": "경상북", "27": "대구",  "48": "경상남", "26": "부산", "31": "울산",
  "50": "제주",
};
// Short aliases for when KOPIS returns abbreviated names (e.g. "전남" instead of "전라남도").
const AREA_SHORT: Record<string, string> = {
  "43": "충북", "44": "충남",
  "45": "전북", "46": "전남",
  "47": "경북", "48": "경남",
};

export async function fetchShows(
  apiKey: string,
  areaCode = "11",
  subAreaCode = "",
  fullView = false,
  genres: string[] = []
): Promise<ShowsPayload> {
  const now = new Date();
  const add = (n: number) => {
    const d = new Date(now);
    d.setDate(now.getDate() + n);
    return dateToKopis(d);
  };
  const today = dateToKopis(now);
  const day3 = add(3);
  const day30 = add(30);

  // Kick off AAAB (어린이) ID fetch in parallel — resolves before enrichPosters
  const childrenExclPromise = kFetch("pblprfr", {
    service: apiKey,
    stdate: today,
    eddate: add(180),
    cpage: "1",
    rows: "200",
    prfstate: "02",
    shcate: GENRE_SHCATE["어린이"],
  }).catch(() => "");

  // 1. Popular shows — nationwide boxoffice OR region-specific pblprfr ──────────
  // KOPIS boxoffice API does NOT support signgucode — it is a nationwide-only chart.
  // When a region is selected we bypass it entirely and query pblprfr with signgucode.
  let popular: ProcessedShow[] = [];

  if (!areaCode) {
    // No region selected → use the weekly nationwide boxoffice chart
    const boxXml = await kFetch("boxoffice", {
      service: apiKey,
      stdate: add(-7),
      eddate: today,
      catecode: "AAAA",
    });
    popular = blocks(boxXml, "boxof")
      .slice(0, fullView ? 10 : 3)
      .map((b, i) => {
        const prfpd = tag(b, "prfpd");
        const [from = "", rawTo = ""] = prfpd.split("~").map((s) => s.trim());
        const to = rawTo || from;
        const seatcnt = tag(b, "seatcnt");
        return toProcessed(
          {
            id: tag(b, "mt20id"),
            title: tag(b, "prfnm"),
            from,
            to,
            venue: tag(b, "prfplcnm"),
            poster: (() => { const u = tag(b, "poster").replace(/^http:/, "https:"); return isValidKopisPoster(u) ? u : ""; })(),
            area: tag(b, "area"),
            running: "",
            genre: tag(b, "cate"),
          },
          {
            rank: i + 1,
            viewers: seatcnt && Number(seatcnt) > 0
              ? `${Number(seatcnt).toLocaleString()}석 규모`
              : undefined,
          }
        );
      });
  } else {
    // Region selected → pblprfr with signgucode + area post-filter
    // Post-filter removes the off-region shows KOPIS occasionally sneaks in.
    const popKeyword = AREA_KEYWORD[areaCode] ?? "";
    const popShort   = AREA_SHORT[areaCode]   ?? "";
    const isInRegion = (s: ShowBlock) => {
      if (!s.id) return false;
      if (!popKeyword || !s.area) return true;
      return s.area.includes(popKeyword) || (popShort ? s.area.includes(popShort) : false);
    };

    const popXml = await kFetch("pblprfr", {
      service: apiKey,
      stdate: today,
      eddate: add(90),
      cpage: "1",
      rows: fullView ? "20" : "10",
      signgucode: areaCode,
    }).catch(() => "");

    popular = blocks(popXml, "db")
      .map(parseBlock)
      .filter((s) => isInRegion(s) && notChildrenShow(s))
      .slice(0, fullView ? 10 : 3)
      .map((s, i) => toProcessed(s, { rank: i + 1 }));
  }

  // 2. LAST CHANCE — ending within 3 days ────────────────────────────────────
  const lcParams: Record<string, string> = {
    service: apiKey,
    stdate: today,
    eddate: fullView ? add(7) : day3,
    cpage: "1",
    rows: fullView ? "50" : "20",
    prfstate: "02",
  };
  if (areaCode) lcParams.signgucode = areaCode;
  if (subAreaCode) lcParams.signgucodesub = subAreaCode;
  const lcXml = await kFetch("pblprfr", lcParams);

  let lastChance: ProcessedShow[] = blocks(lcXml, "db")
    .map(parseBlock)
    .filter((s) => {
      if (!notChildrenShow(s)) return false;
      const d = calcDday(s.to);
      return d !== null && d.value <= (fullView ? 7 : 3);
    })
    .sort(
      (a, b) =>
        (calcDday(a.to)?.value ?? 99) - (calcDday(b.to)?.value ?? 99)
    )
    .slice(0, fullView ? 15 : 3)
    .map((s) => {
      const d = calcDday(s.to)!;
      return toProcessed(s, {
        copy: DDAY_COPY[d.value] ?? `D-${d.value} 마감`,
        badges: [s.running || "공연중"],
      });
    });

  // 3. Hidden gems — niche genres (dance + jazz) ────────────────────────────
  const hiddenBase: Record<string, string> = {
    service: apiKey,
    stdate: today,
    eddate: day30,
    cpage: "1",
    rows: "30",
    prfstate: "02",
  };
  if (areaCode) hiddenBase.signgucode = areaCode;
  if (subAreaCode) hiddenBase.signgucodesub = subAreaCode;
  const [danceXml, jazzXml] = await Promise.all([
    kFetch("pblprfr", { ...hiddenBase, shcate: "BBBE" }),
    kFetch("pblprfr", { ...hiddenBase, shcate: "CCCD" }),
  ]);

  const hidden: ProcessedShow[] = [
    ...blocks(danceXml, "db"),
    ...blocks(jazzXml, "db"),
  ]
    .map(parseBlock)
    .filter((s) => s.id)
    .slice(0, fullView ? 8 : 2)
    .map((s) =>
      toProcessed(s, { recommendReason: recommendFor(s.genre) })
    );

  // 4. Nearby — area-specific, genre-personalized ──────────────────────────
  const nearbyParams: Record<string, string> = {
    service: apiKey,
    stdate: today,
    eddate: day30,
    cpage: "1",
    rows: fullView ? "30" : "16",
    prfstate: "02",
  };
  if (areaCode) nearbyParams.signgucode = areaCode;
  if (subAreaCode) nearbyParams.signgucodesub = subAreaCode;

  // Post-filter: KOPIS sometimes returns off-region shows despite the area filter.
  // When the area field is missing/empty we trust the signgucode we sent (don't reject).
  const areaKeyword = AREA_KEYWORD[areaCode] ?? "";
  const areaShort   = AREA_SHORT[areaCode]   ?? "";
  const inArea = (s: ShowBlock) =>
    Boolean(s.id) && (
      !areaKeyword ||
      !s.area ||            // trust KOPIS signgucode when area field is absent
      s.area.includes(areaKeyword) ||
      (areaShort && s.area.includes(areaShort))
    );

  // Run base fetch + optional genre-specific fetch in parallel
  const firstShcate = genres[0] ? GENRE_SHCATE[genres[0]] : null;
  const [nearbyXml, genreXml] = await Promise.all([
    kFetch("pblprfr", nearbyParams),
    firstShcate
      ? kFetch("pblprfr", { ...nearbyParams, shcate: firstShcate, rows: "20" }, 6_000)
          .catch(() => "")
      : Promise.resolve(""),
  ]);

  // Genre-matched shows come first; base shows fill remaining slots (deduped)
  const genreNearby = genreXml
    ? blocks(genreXml, "db").map(parseBlock).filter((s) => inArea(s) && notChildrenShow(s))
    : [];
  const genreIds = new Set(genreNearby.map((s) => s.id));
  const baseNearby = blocks(nearbyXml, "db")
    .map(parseBlock)
    .filter((s) => inArea(s) && !genreIds.has(s.id) && notChildrenShow(s));

  let nearby: ProcessedShow[] = [...genreNearby, ...baseNearby]
    .slice(0, fullView ? 20 : 4)
    .map((s) => toProcessed(s));

  // Fallback tier 1: inArea may have been too strict — retry with no area keyword check
  // (trust whatever KOPIS returned for our signgucode)
  if (nearby.length === 0 && areaCode) {
    const rawAll = blocks(nearbyXml, "db")
      .map(parseBlock)
      .filter((s) => Boolean(s.id) && notChildrenShow(s));
    if (rawAll.length > 0) {
      nearby = rawAll.slice(0, fullView ? 20 : 4).map((s) => toProcessed(s));
    }
  }

  // Fallback tier 2: truly no shows in this area — surface popular/lastChance
  if (nearby.length === 0) {
    nearby = [...lastChance, ...popular].slice(0, fullView ? 20 : 4);
  }

  // Apply AAAB exclusion: remove any show that KOPIS classifies as 어린이 from all other sections
  const childrenExclXml = await childrenExclPromise;
  const childrenIds = new Set(
    blocks(childrenExclXml, "db").map(b => tag(b, "mt20id")).filter(Boolean)
  );
  if (childrenIds.size > 0) {
    const excl = (arr: ProcessedShow[]) => arr.filter(s => !childrenIds.has(s.id));
    popular     = excl(popular);
    lastChance  = excl(lastChance);
    nearby      = excl(nearby);
  }

  // Enrich any shows that came back without a poster URL
  const [ep, elc, eh, en] = await Promise.all([
    enrichPosters(apiKey, popular),
    enrichPosters(apiKey, lastChance),
    enrichPosters(apiKey, hidden),
    enrichPosters(apiKey, nearby),
  ]);

  return { popular: ep, lastChance: elc, hidden: eh, nearby: en };
}

// ─── Genre-specific fetch ─────────────────────────────────────────────────────

export const GENRE_SHCATE: Record<string, string> = {
  "연극":    "AAAA",
  "뮤지컬":  "GGGA",
  "클래식":  "CCCA",
  "전통예술":"CCCC",
  "재즈":    "CCCD",
  "인디음악":"CCCD",
  "무용":    "BBBE",
  "어린이":  "AAAB",
};

// ─── Venue ───────────────────────────────────────────────────────────────────

export interface Venue {
  id: string;
  name: string;
  area: string;
  district: string;
  seats: number;
}

function parseVenueBlock(b: string): Venue {
  return {
    id:       tag(b, "mt10id"),
    name:     tag(b, "fcltynm") || tag(b, "fcltyNm"),
    area:     tag(b, "sidonm"),
    district: tag(b, "gugunnm"),
    seats:    Number(tag(b, "seatscale")) || 0,
  };
}

export async function fetchVenues(
  apiKey: string,
  areaCode: string
): Promise<Venue[]> {
  try {
    const xml = await kFetch("prfplc", {
      service: apiKey,
      cpage: "1",
      rows: "100",
      signgucode: areaCode,
    }, 8_000);
    return blocks(xml, "db")
      .map(parseVenueBlock)
      .filter((v) => v.id && v.name);
  } catch {
    return [];
  }
}

// ─── Venue-specific shows ─────────────────────────────────────────────────────

export async function fetchShowsByVenueName(
  apiKey: string,
  venueName: string,
  rows = 12
): Promise<ProcessedShow[]> {
  const now = new Date();
  const today = dateToKopis(now);
  const later = new Date(now);
  later.setDate(now.getDate() + 90);
  try {
    const xml = await kFetch("pblprfr", {
      service: apiKey,
      stdate: today,
      eddate: dateToKopis(later),
      cpage: "1",
      rows: String(rows),
      prfstate: "02",
      shfcltynm: venueName,
    });
    const shows = blocks(xml, "db")
      .map(parseBlock)
      .filter((s) => s.id)
      .map((s) => toProcessed(s));
    return enrichPosters(apiKey, shows);
  } catch {
    return [];
  }
}

export async function fetchShowsByVenue(
  apiKey: string,
  venueId: string
): Promise<ProcessedShow[]> {
  const now = new Date();
  const today = dateToKopis(now);
  const later = new Date(now);
  later.setDate(now.getDate() + 60);
  try {
    const xml = await kFetch("pblprfr", {
      service: apiKey,
      stdate: today,
      eddate: dateToKopis(later),
      cpage: "1",
      rows: "12",
      prfstate: "02",
      prfplccd: venueId,
    });
    const shows = blocks(xml, "db")
      .map(parseBlock)
      .filter((s) => s.id)
      .map((s) => toProcessed(s));
    return enrichPosters(apiKey, shows);
  } catch {
    return [];
  }
}

// ─── Personalized Last Chance ─────────────────────────────────────────────────

export interface PersonalizedLC {
  shows: ProcessedShow[];
  priority: 1 | 2 | 3 | 4;
  label: string;
}

async function tryLC(
  apiKey: string,
  extra: Record<string, string>
): Promise<ProcessedShow[]> {
  const now = new Date();
  const today = dateToKopis(now);
  const day7 = new Date(now);
  day7.setDate(now.getDate() + 7);
  const xml = await kFetch("pblprfr", {
    service: apiKey,
    stdate: today,
    eddate: dateToKopis(day7),
    cpage: "1",
    rows: "20",
    prfstate: "02",
    ...extra,
  });
  return blocks(xml, "db")
    .map(parseBlock)
    .filter((s) => { const d = calcDday(s.to); return d !== null && d.value <= 7; })
    .sort((a, b) => (calcDday(a.to)?.value ?? 99) - (calcDday(b.to)?.value ?? 99))
    .slice(0, 6)
    .map((s) => {
      const d = calcDday(s.to)!;
      return toProcessed(s, { copy: DDAY_COPY[d.value] ?? `D-${d.value} 마감` });
    });
}

export async function fetchPersonalizedLC(
  apiKey: string,
  opts: {
    areaCode: string;
    subAreaCode?: string;
    venueId?: string;
    venueName?: string;
    areaName?: string;
    genres?: string[];
  }
): Promise<PersonalizedLC> {
  const { areaCode, subAreaCode = "", venueId, venueName = "", areaName = "", genres = [] } = opts;
  const shcate   = genres.length > 0 ? GENRE_SHCATE[genres[0]] : undefined;
  const subExtra: Record<string, string> = subAreaCode ? { signgucodesub: subAreaCode } : {};

  if (venueId && shcate) {
    try {
      const shows = await tryLC(apiKey, { prfplccd: venueId, shcate });
      if (shows.length >= 2) return { shows, priority: 1, label: `${venueName} × ${genres[0]}` };
    } catch { /* fall */ }
  }
  if (shcate) {
    try {
      const shows = await tryLC(apiKey, { signgucode: areaCode, shcate, ...subExtra });
      if (shows.length >= 2) return { shows, priority: 2, label: `${areaName} × ${genres[0]}` };
    } catch { /* fall */ }
  }
  try {
    const shows = await tryLC(apiKey, { signgucode: areaCode, ...subExtra });
    if (shows.length >= 1) return { shows, priority: 3, label: `${areaName} 전체` };
  } catch { /* fall */ }
  try {
    const shows = await tryLC(apiKey, {});
    return { shows, priority: 4, label: "전국" };
  } catch {
    return { shows: [], priority: 4, label: "전국" };
  }
}

// ─── Genre-specific fetch ─────────────────────────────────────────────────────

export async function fetchShowsByGenre(
  apiKey: string,
  shcate: string,
  rows = 8,
  areaCode = ""
): Promise<ProcessedShow[]> {
  const now = new Date();
  const today = dateToKopis(now);
  const later = new Date(now);
  later.setDate(now.getDate() + 90);
  const end = dateToKopis(later);

  try {
    const params: Record<string, string> = {
      service: apiKey,
      stdate: today,
      eddate: end,
      cpage: "1",
      rows: String(rows),
      shcate,
    };
    if (areaCode) params.signgucode = areaCode;
    const xml = await kFetch("pblprfr", params);
    const keyword = areaCode ? (AREA_KEYWORD[areaCode] ?? "") : "";
    const short   = areaCode ? (AREA_SHORT[areaCode]   ?? "") : "";
    const shows = blocks(xml, "db")
      .map(parseBlock)
      .filter((s) => {
        if (!s.id) return false;
        if (!keyword || !s.area) return true;
        return s.area.includes(keyword) || (short ? s.area.includes(short) : false);
      })
      .map((s) => toProcessed(s));
    return enrichPosters(apiKey, shows);
  } catch {
    return [];
  }
}

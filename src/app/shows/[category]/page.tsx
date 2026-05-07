"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ProcessedShow, ShowsPayload, ShowTheme } from "@/types/show";
import { PosterCard } from "@/components/home/PosterCard";
import { getUserPrefs } from "@/lib/userPrefs";
import { buildDetailUrl } from "@/app/shows/detail/[id]/page";
import { ALL_REGIONS } from "@/lib/regions";

const CATEGORY_META: Record<string, { label: string; icon?: string; redDot?: boolean }> = {
  popular:      { label: "인기 공연",     icon: "🔥" },
  "last-chance": { label: "Last Chance", redDot: true },
  hidden:       { label: "숨은 공연 발견", icon: "✦" },
  nearby:       { label: "근처 공연",     icon: "📍" },
};

interface KopisItem {
  id: string;
  title: string;
  place: string;
  startDate: string;
  endDate: string;
  poster: string | null;
  genre: string;
  region: string;
}

const GENRE_THEME: Record<string, ShowTheme> = {
  "연극": "amber",
  "뮤지컬": "teal",
  "서양음악(클래식)": "blue",
  "한국음악(국악)": "emerald",
  "무용(발레)": "purple",
  "무용(현대무용)": "red",
  "무용(한국무용)": "purple",
  "대중음악": "amber",
  "서커스/마술": "teal",
};

function kopisItemToShow(item: KopisItem): ProcessedShow {
  return {
    id: item.id,
    title: item.title,
    genre: item.genre,
    venue: item.place,
    posterUrl: item.poster ?? undefined,
    theme: GENRE_THEME[item.genre] ?? "teal",
    period: `${item.startDate} – ${item.endDate}`,
    area: item.region,
  };
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-2xl animate-pulse bg-white/5" style={{ aspectRatio: "2/3" }} />
      ))}
    </div>
  );
}

// ─── Venue chips ──────────────────────────────────────────────────────────────

interface VenueChip {
  place: string;
  count: number;
}

const VENUE_CHIP_LIMIT = 6;

function deriveVenueChips(shows: ProcessedShow[]): VenueChip[] {
  const counts = new Map<string, number>();
  for (const s of shows) {
    if (s.venue) counts.set(s.venue, (counts.get(s.venue) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([place, count]) => ({ place, count }));
}

// Truncate long venue names for chip labels
function venueLabel(name: string): string {
  if (name.length <= 10) return name;
  // Try to use the last space-separated segment (e.g. "국립중앙극장 해오름극장" → "해오름극장")
  const parts = name.split(" ");
  if (parts.length > 1 && parts.at(-1)!.length <= 9) return parts.at(-1)!;
  return name.slice(0, 9) + "…";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShowsPage() {
  const params = useParams();
  const category = typeof params.category === "string" ? params.category : "";
  const router = useRouter();

  const meta     = CATEGORY_META[category] ?? { label: "공연 목록" };
  const isNearby = category === "nearby";

  const [data,        setData]        = useState<ShowsPayload | null>(null);
  const [allShows,    setAllShows]    = useState<ProcessedShow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>(
    () => getUserPrefs()?.region ?? "서울"
  );
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [venueChipsExpanded, setVenueChipsExpanded] = useState(false);

  const prevArea = useRef(selectedArea);

  // 공연장 칩 목록 (2개 이상 공연이 있는 공연장, 최대 6개)
  const venueChips = useMemo(() => deriveVenueChips(allShows), [allShows]);

  // 선택한 공연장으로 필터링
  const nearbyShows = useMemo(
    () => selectedVenue ? allShows.filter((s) => s.venue === selectedVenue) : allShows,
    [allShows, selectedVenue]
  );

  function handleProvClick(name: string) {
    if (name === selectedArea) return;
    setSelectedArea(name);
    setSelectedVenue("");
  }

  useEffect(() => {
    const areaChanged = prevArea.current !== selectedArea;
    prevArea.current  = selectedArea;

    if (areaChanged) setLoading(true);

    const ctrl = new AbortController();

    if (isNearby) {
      fetch(`/api/kopis?region=${encodeURIComponent(selectedArea)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then(({ items = [] }: { items: KopisItem[] }) => {
          setAllShows(items.map(kopisItemToShow));
          setLoading(false);
        })
        .catch((err) => { if (err.name !== "AbortError") setLoading(false); });
    } else {
      fetch(`/api/shows?area=${encodeURIComponent(selectedArea)}&full=true`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: ShowsPayload) => { setData(d); setLoading(false); })
        .catch((err) => { if (err.name !== "AbortError") setLoading(false); });
    }

    return () => ctrl.abort();
  }, [selectedArea, isNearby]);

  const shows: ProcessedShow[] = (() => {
    if (isNearby) return nearbyShows;
    if (!data)    return [];
    switch (category) {
      case "last-chance": return data.lastChance;
      case "hidden":      return data.hidden;
      default:            return data.popular;
    }
  })();

  const areaLabel = selectedVenue
    ? `${selectedArea} · ${venueLabel(selectedVenue)}`
    : selectedArea;

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0c0c] lg:ml-60">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 lg:left-60 z-40 flex items-center gap-3 px-4 pt-5 pb-4 bg-[#0c0c0c]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => router.back()}
          className="text-white/50 hover:text-white/90 transition-colors p-1 -ml-1"
          aria-label="뒤로"
        >
          <BackIcon />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {meta.redDot && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block flex-none" />
          )}
          {meta.icon && <span className="text-sm leading-none flex-none">{meta.icon}</span>}
          <h1
            className={`font-black text-white truncate ${
              meta.redDot
                ? "text-[12px] tracking-[0.22em] uppercase"
                : "text-[17px] tracking-[0.04em]"
            }`}
          >
            {isNearby ? areaLabel : meta.label}
          </h1>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 pb-24 lg:pb-8" style={{ paddingTop: isNearby ? 68 : 72 }}>

        {/* ── 시/도 칩 — nearby only ──────────────────────────────────────── */}
        {isNearby && (
          <div
            className="sticky z-30 bg-[#0c0c0c]"
            style={{ top: 68, borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            {/* 시/도 행 */}
            <div
              className="flex gap-2 overflow-x-auto px-5 pt-3 pb-2 lg:flex-wrap lg:overflow-x-visible"
              style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
            >
              {ALL_REGIONS.map((r) => {
                const active = selectedArea === r.name;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleProvClick(r.name)}
                    className="flex-none px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all"
                    style={
                      active
                        ? { background: "rgba(255,255,255,0.9)", color: "#0c0c0c" }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.4)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }
                    }
                  >
                    {r.name}
                  </button>
                );
              })}
              <div className="flex-none w-1" aria-hidden />
            </div>

            {/* 공연장 칩 행 */}
            {!loading && venueChips.length > 0 && (
              <div
                className="flex flex-wrap gap-2 px-5 pt-1 pb-2.5"
              >
                <button
                  onClick={() => setSelectedVenue("")}
                  className="flex-none px-3 py-1 rounded-full text-[10px] font-bold transition-all"
                  style={
                    selectedVenue === ""
                      ? { background: "#fbbf24", color: "#0c0c0c" }
                      : {
                          background: "rgba(251,191,36,0.07)",
                          color: "rgba(251,191,36,0.7)",
                          border: "1px solid rgba(251,191,36,0.2)",
                        }
                  }
                >
                  전체
                </button>
                {(venueChipsExpanded ? venueChips : venueChips.slice(0, VENUE_CHIP_LIMIT)).map(({ place, count }) => {
                  const active = selectedVenue === place;
                  return (
                    <button
                      key={place}
                      onClick={() => setSelectedVenue(active ? "" : place)}
                      className="flex-none px-3 py-1 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap"
                      style={
                        active
                          ? { background: "#fbbf24", color: "#0c0c0c" }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.38)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }
                      }
                    >
                      {venueLabel(place)}
                      <span className="ml-1 opacity-50 text-[9px]">{count}</span>
                    </button>
                  );
                })}
                {!venueChipsExpanded && venueChips.length > VENUE_CHIP_LIMIT && (
                  <button
                    onClick={() => setVenueChipsExpanded(true)}
                    className="flex-none px-3 py-1 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.35)",
                      border: "1px dashed rgba(255,255,255,0.12)",
                    }}
                  >
                    +{venueChips.length - VENUE_CHIP_LIMIT} 더보기
                  </button>
                )}
                {venueChipsExpanded && venueChips.length > VENUE_CHIP_LIMIT && (
                  <button
                    onClick={() => setVenueChipsExpanded(false)}
                    className="flex-none px-3 py-1 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.35)",
                      border: "1px dashed rgba(255,255,255,0.12)",
                    }}
                  >
                    접기
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Count label */}
        {!loading && shows.length > 0 && (
          <p
            className="px-5 pt-4 mb-4 text-[11px]"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            {isNearby
              ? `${areaLabel} · 총 ${shows.length}개 공연`
              : `총 ${shows.length}개 공연`
            }
          </p>
        )}

        {loading ? (
          <GridSkeleton />
        ) : shows.length === 0 ? (
          <p
            className="text-center pt-24 text-[12px]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {isNearby
              ? `${areaLabel}에 공연 정보가 없습니다`
              : "공연 정보가 없습니다"
            }
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-5">
            {shows.map((s) => (
              <PosterCard
                key={s.id}
                show={s}
                onClick={() => router.push(buildDetailUrl(s))}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

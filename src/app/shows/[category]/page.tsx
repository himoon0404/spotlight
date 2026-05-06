"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ProcessedShow, ShowsPayload, ShowTheme } from "@/types/show";
import { PosterCard } from "@/components/home/PosterCard";
import { getUserPrefs } from "@/lib/userPrefs";

const CATEGORY_META: Record<string, { label: string; icon?: string; redDot?: boolean }> = {
  popular:     { label: "인기 공연",    icon: "🔥" },
  "last-chance": { label: "Last Chance", redDot: true },
  hidden:      { label: "숨은 공연 발견", icon: "✦" },
  nearby:      { label: "근처 공연",    icon: "📍" },
};

const AREAS = ["서울", "경기", "부산", "대구", "인천", "광주", "대전", "울산"];

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

export default function ShowsPage() {
  const params = useParams();
  const category = typeof params.category === "string" ? params.category : "";
  const router = useRouter();

  const meta = CATEGORY_META[category] ?? { label: "공연 목록" };
  const isNearby = category === "nearby";

  const [data, setData]             = useState<ShowsPayload | null>(null);
  const [nearbyShows, setNearbyShows] = useState<ProcessedShow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>(
    () => getUserPrefs()?.region ?? "서울"
  );

  const prevArea = useRef(selectedArea);

  useEffect(() => {
    const areaChanged = prevArea.current !== selectedArea;
    prevArea.current = selectedArea;

    if (areaChanged) setLoading(true);

    const ctrl = new AbortController();

    if (isNearby) {
      fetch(`/api/kopis?region=${encodeURIComponent(selectedArea)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then(({ items = [] }: { items: KopisItem[] }) => {
          setNearbyShows(items.map(kopisItemToShow));
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
    if (!data) return [];
    switch (category) {
      case "last-chance": return data.lastChance;
      case "hidden":      return data.hidden;
      default:            return data.popular;
    }
  })();

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0c0c] lg:ml-[240px]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 lg:left-[240px] z-40 flex items-center gap-3 px-4 pt-5 pb-4 bg-[#0c0c0c]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => router.back()}
          className="text-white/50 hover:text-white/90 transition-colors p-1 -ml-1"
          aria-label="뒤로"
        >
          <BackIcon />
        </button>

        <div className="flex items-center gap-2">
          {meta.redDot && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          )}
          {meta.icon && <span className="text-sm leading-none">{meta.icon}</span>}
          <h1
            className={`font-black text-white ${
              meta.redDot
                ? "text-[12px] tracking-[0.22em] uppercase"
                : "text-[17px] tracking-[0.04em]"
            }`}
          >
            {meta.label}
          </h1>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 pt-[72px] pb-24 lg:pb-8">

        {/* Area chips — nearby only */}
        {isNearby && (
          <div
            className="flex gap-2 overflow-x-auto px-5 py-3 lg:flex-wrap lg:overflow-x-visible"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {AREAS.map((area) => {
              const active = selectedArea === area;
              return (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
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
                  {area}
                </button>
              );
            })}
            <div className="flex-none w-1" aria-hidden />
          </div>
        )}

        {/* Count label */}
        {!loading && shows.length > 0 && (
          <p
            className="px-5 mb-4 text-[11px]"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            총 {shows.length}개 공연
          </p>
        )}

        {loading ? (
          <GridSkeleton />
        ) : shows.length === 0 ? (
          <p
            className="text-center pt-24 text-[12px]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {isNearby ? `${selectedArea}에 공연 정보가 없습니다` : "공연 정보가 없습니다"}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-5">
            {shows.map((s) => (
              <PosterCard key={s.id} show={s} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

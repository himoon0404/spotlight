"use client";

import { useState, useEffect } from "react";
import { GENRES } from "@/lib/searchMockData";
import type { SearchShow } from "@/lib/searchMockData";
import { PerformanceCard } from "./PerformanceCard";

const GENRE_THEME: Record<string, string> = {
  "뮤지컬":   "teal",
  "연극":     "amber",
  "재즈":     "teal",
  "클래식":   "blue",
  "인디음악": "purple",
  "무용":     "purple",
  "전통예술": "emerald",
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

function computeDday(endDateStr: string): number | null {
  const parts = endDateStr.split(".");
  if (parts.length !== 3) return null;
  const end = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  return diff >= 0 ? diff : null;
}

function kopisToSearchShow(item: KopisItem, genre: string): SearchShow {
  const dday = computeDday(item.endDate);
  const show: SearchShow = {
    id: item.id,
    venueId: "",
    title: item.title,
    venue: item.place,
    region: item.region,
    area: item.region,
    genre,
    subGenre: "",
    period: `${item.startDate} – ${item.endDate}`,
    theme: GENRE_THEME[genre] ?? "teal",
    poster: item.poster ?? undefined,
    posterUrl: item.poster ?? undefined,
    isHidden: false,
    hasEvent: false,
    price: 0,
    reviewCount: 0,
  };
  if (dday != null) {
    show.dday = dday;
    show.ddayLabel = dday === 0 ? "D-Day" : `D-${dday}`;
    show.isCritical = dday <= 3;
  }
  return show;
}

interface Props {
  keyword: string;
}

export function GenreSearch({ keyword }: Props) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [shows, setShows]                 = useState<SearchShow[]>([]);
  const [loading, setLoading]             = useState(false);

  function handleGenreClick(name: string) {
    setSelectedGenre((prev) => (prev === name ? null : name));
  }

  useEffect(() => {
    if (!selectedGenre) { setShows([]); return; }
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/kopis?genre=${encodeURIComponent(selectedGenre)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then(({ items = [] }: { items: KopisItem[] }) => {
        setShows(items.map((item) => kopisToSearchShow(item, selectedGenre)));
        setLoading(false);
      })
      .catch((err) => { if (err.name !== "AbortError") setLoading(false); });
    return () => ctrl.abort();
  }, [selectedGenre]);

  const filteredShows = keyword.trim()
    ? shows.filter((s) => s.title.includes(keyword) || s.venue.includes(keyword))
    : shows;

  return (
    <div className="px-5">

      {/* ── 장르 그리드 ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(GENRES).map(([name, { emoji }]) => {
          const active = selectedGenre === name;
          return (
            <button
              key={name}
              onClick={() => handleGenreClick(name)}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all duration-200"
              style={active
                ? { background: "rgba(251,191,36,0.14)", border: "1.5px solid rgba(251,191,36,0.5)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              <span className="text-xl leading-none">{emoji}</span>
              <span className="text-[10px] font-bold tracking-tight" style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.6)" }}>
                {name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 결과 영역 ────────────────────────────────────────────────────── */}
      <div
        style={{
          maxHeight: selectedGenre ? "6000px" : "0px",
          opacity:   selectedGenre ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.45s ease, opacity 0.3s ease 0.05s",
        }}
      >
        {selectedGenre && (
          <div className="mt-5">
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="text-[14px] font-bold text-white">
                {selectedGenre} 공연
              </h3>
              {!loading && (
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {filteredShows.length}개
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse bg-white/5" style={{ height: 116 }} />
                ))}
              </div>
            ) : filteredShows.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {filteredShows.map((s) => <PerformanceCard key={s.id} show={s} />)}
              </div>
            ) : (
              <div className="rounded-2xl py-8 text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-3xl mb-3">🎭</p>
                <p className="text-[13px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                  해당 장르의 공연이 없어요
                </p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                  다른 장르를 선택해보세요
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

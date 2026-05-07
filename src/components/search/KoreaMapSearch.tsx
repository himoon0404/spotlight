"use client";

import { useState, useEffect } from "react";
import type { SearchShow } from "@/types/show";
import type { Region } from "@/lib/regionCoordinates";
import { getPerformancesByRegion } from "@/lib/kopisRegion";
import type { MapMarker, Performance } from "@/lib/kopisRegion";
import { ALL_REGION_DOTS } from "@/lib/regionCoordinates";
import { KoreaMap } from "./KoreaMap";
import { PerformanceCard } from "./PerformanceCard";
import { VenueFilterChips } from "./VenueFilterChips";
import { useVenueFilter } from "@/hooks/useVenueFilter";

interface Props {
  keyword: string;
}

function showToPerformance(show: SearchShow): Performance {
  const parts = show.period.split(" – ");
  return {
    id:        show.id,
    title:     show.title,
    place:     show.venue,
    startDate: parts[0] ?? "",
    endDate:   parts[1] ?? "",
    poster:    "",
    genre:     show.genre,
    state:     "공연중",
    region:    show.region,
  };
}

export function KoreaMapSearch({ keyword }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [shows,   setShows]   = useState<SearchShow[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const { venues, selectedVenue, setSelectedVenue, venueFiltered } = useVenueFilter(shows);

  useEffect(() => {
    if (!selectedRegion) {
      setShows([]);
      setMarkers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    getPerformancesByRegion(selectedRegion.name)
      .then((data) => {
        const filtered = keyword.trim()
          ? (() => {
              const q = keyword.toLowerCase();
              return data.filter(
                (s) =>
                  s.title.toLowerCase().includes(q) ||
                  s.venue.toLowerCase().includes(q) ||
                  s.genre.toLowerCase().includes(q)
              );
            })()
          : data;
        return filtered;
      })
      .then((filtered) => {
        setShows(filtered);

        // MapMarker 구성 — 선택 지역의 공연 수를 지도에 표시
        const dot = ALL_REGION_DOTS.find((d) => d.name === selectedRegion.name);
        if (dot) {
          setMarkers([{
            region:       selectedRegion.name,
            x:            dot.cx,
            y:            dot.cy,
            count:        filtered.length,
            performances: filtered.map(showToPerformance),
          }]);
        }
      })
      .catch(() => setError("공연 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요."))
      .finally(() => setLoading(false));
  }, [selectedRegion, keyword]);

  const lastChance = venueFiltered.filter((s) => s.isLastChance);
  const regular    = venueFiltered.filter((s) => !s.isLastChance);

  return (
    <div>
      {/* ── 지도 ─────────────────────────────────────────────────────────── */}
      <div className="mx-5 mb-5">

        {/* 선택 지역 배지 */}
        {selectedRegion && (
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{
                background: "rgba(251,191,36,0.12)",
                border: "1px solid rgba(251,191,36,0.4)",
              }}
            >
              <span className="text-[11px] font-bold" style={{ color: "#fbbf24" }}>
                📍 {selectedRegion.name}
              </span>
              <button
                onClick={() => setSelectedRegion(null)}
                className="flex items-center"
                style={{ color: "rgba(251,191,36,0.55)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {!loading && !error && (
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {shows.length}개 공연
              </span>
            )}
          </div>
        )}

        {/* SVG 지도 */}
        <KoreaMap
          regions={[]}
          selectedId={selectedRegion?.id ?? null}
          onSelect={setSelectedRegion}
          markers={markers}
        />
      </div>

      {/* ── 결과 영역 ─────────────────────────────────────────────────────── */}
      {selectedRegion && (
        <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>

          {/* 공연장 칩 필터 */}
          {!loading && !error && (
            <VenueFilterChips
              venues={venues}
              selected={selectedVenue}
              onSelect={setSelectedVenue}
            />
          )}

          <div className="flex items-baseline gap-2 mb-4 px-5 mt-4">
            <h3 className="text-[15px] font-black text-white">
              {selectedRegion.name}에서 볼 수 있는 공연
            </h3>
            {!loading && !error && shows.length > 0 && (
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                {venueFiltered.length}개
              </span>
            )}
          </div>

          <div className="px-5">
          {/* 로딩 스켈레톤 */}
          {loading && (
            <div className="flex flex-col gap-2.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl"
                  style={{
                    height: 106,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    animation: `dday-pulse 1.8s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* 에러 상태 */}
          {!loading && error && (
            <div
              className="rounded-2xl py-8 text-center"
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <p className="text-2xl mb-3">⚠️</p>
              <p className="text-[13px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                {error}
              </p>
              <button
                onClick={() => {
                  const r = selectedRegion;
                  setSelectedRegion(null);
                  setTimeout(() => setSelectedRegion(r), 50);
                }}
                className="mt-3 px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* LAST CHANCE 공연 */}
          {!loading && !error && lastChance.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="dday-urgent inline-block w-2 h-2 rounded-full flex-none"
                  style={{ background: "#ef4444" }}
                />
                <span
                  className="text-[11px] font-black tracking-[0.18em]"
                  style={{ color: "#f87171" }}
                >
                  LAST CHANCE
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {lastChance.map((s) => (
                  <PerformanceCard key={s.id} show={s} />
                ))}
              </div>
            </div>
          )}

          {/* 일반 공연 */}
          {!loading && !error && regular.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {regular.map((s) => (
                <PerformanceCard key={s.id} show={s} />
              ))}
            </div>
          )}

          {/* 결과 없음 */}
          {!loading && !error && venueFiltered.length === 0 && (
            <div
              className="rounded-2xl py-10 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-3xl mb-3">🗺️</p>
              <p className="text-[13px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                {keyword ? "검색 결과가 없어요" : "아직 등록된 공연이 없어요"}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                다른 지역을 탐색해보세요
              </p>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

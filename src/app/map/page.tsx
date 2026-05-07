"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SearchShow } from "@/types/show";
import { getPerformancesByRegion } from "@/lib/kopisRegion";
import type { MapMarker, Performance } from "@/lib/kopisRegion";
import { ALL_REGION_DOTS } from "@/lib/regionCoordinates";
import type { Region } from "@/lib/regionCoordinates";
import { KoreaMap } from "@/components/search/KoreaMap";
import { PerformanceCard } from "@/components/search/PerformanceCard";

// ─── Icons ────────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="m12 5-7 7 7 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function showToPerformance(show: SearchShow): Performance {
  const parts = show.period.split(" – ");
  return {
    id: show.id, title: show.title, place: show.venue,
    startDate: parts[0] ?? "", endDate: parts[1] ?? "",
    poster: show.poster ?? "", genre: show.genre, state: "공연중",
    region: show.region,
  };
}

// ─── Result card skeletons ─────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 px-5">
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MapPage() {
  const router = useRouter();

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [shows,   setShows]   = useState<SearchShow[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Fetch shows for selected region
  useEffect(() => {
    if (!selectedRegion) { setShows([]); setMarkers([]); setError(null); return; }

    setLoading(true);
    setError(null);

    getPerformancesByRegion(selectedRegion.name)
      .then((data) => {
        setShows(data);
        const dot = ALL_REGION_DOTS.find((d) => d.name === selectedRegion.name);
        if (dot) {
          setMarkers([{
            region: selectedRegion.name,
            x: dot.cx, y: dot.cy,
            count: data.length,
            performances: data.map(showToPerformance),
          }]);
        }
      })
      .catch(() => setError("공연 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요."))
      .finally(() => setLoading(false));
  }, [selectedRegion]);

  const hasResults = !loading && !error && shows.length > 0;
  const lastChance = shows.filter((s) => s.isLastChance);
  const regular    = shows.filter((s) => !s.isLastChance);

  // Map shrinks when results panel is visible
  const mapExpanded = !selectedRegion;

  return (
    <div
      className="fixed inset-0 lg:left-[240px] flex flex-col"
      style={{ background: "#050a14", color: "#ffffff" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        className="flex-none flex items-center gap-3 px-5"
        style={{
          height: 56,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(5,10,20,0.97)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors"
        >
          <BackIcon />
          <span className="text-[13px] font-medium">뒤로</span>
        </button>

        <div className="flex items-center gap-2 ml-3">
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
            style={{ boxShadow: "0 0 6px rgba(251,191,36,0.5)" }}
          />
          <span className="text-[14px] font-black tracking-[0.18em]">지도 탐색</span>
        </div>

        {/* Selected region tag in header */}
        {selectedRegion && (
          <div
            className="flex items-center gap-1.5 ml-auto pl-3 pr-2 py-1 rounded-full"
            style={{
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.4)",
            }}
          >
            <span className="text-[11px] font-bold" style={{ color: "#fbbf24" }}>
              📍 {selectedRegion.name}
            </span>
            {!loading && !error && (
              <span className="text-[10px]" style={{ color: "rgba(251,191,36,0.5)" }}>
                {shows.length}개
              </span>
            )}
            <button
              onClick={() => setSelectedRegion(null)}
              className="flex items-center justify-center w-4 h-4 rounded-full ml-0.5"
              style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}
            >
              <CloseIcon />
            </button>
          </div>
        )}
      </header>

      {/* ── Content: map + results (flex-col mobile / flex-row PC) ──────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── Map area ──────────────────────────────────────────────────────── */}
        <div
          className="map-area-responsive flex-none relative overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            height: mapExpanded
              ? "calc(100dvh - 56px)"
              : "min(52dvh, 360px)",
          }}
        >
          <KoreaMap
            regions={[]}
            selectedId={selectedRegion?.id ?? null}
            onSelect={setSelectedRegion}
            markers={markers}
            svgStyle={{ height: "100%" }}
          />

          {!selectedRegion && (
            <div className="absolute bottom-8 inset-x-0 text-center pointer-events-none">
              <p className="text-[11px] font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.22)" }}>
                지역을 눌러 해당 지역의 공연을 확인하세요
              </p>
            </div>
          )}
        </div>

        {/* ── Results panel ─────────────────────────────────────────────────── */}
        <div
          className={`overflow-y-auto lg:flex-none lg:w-[400px] lg:border-l ${
            selectedRegion ? "flex-1" : "hidden lg:flex lg:flex-col"
          }`}
          style={{
            background: "#0c0c0c",
            borderTop: selectedRegion ? "1px solid rgba(255,255,255,0.07)" : undefined,
            borderLeft: undefined,
            ...(selectedRegion ? { animation: "fadeSlideUp 0.25s ease both" } : {}),
          }}
        >
          {/* PC placeholder when no region selected */}
          {!selectedRegion && (
            <div className="flex h-full flex-col items-center justify-center text-center px-8 gap-4">
              <p className="text-5xl">🗺️</p>
              <div>
                <p className="text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>지역을 선택해 주세요</p>
                <p className="text-[12px] mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>지도에서 지역을 눌러보세요</p>
              </div>
            </div>
          )}

          {/* Results content */}
          {selectedRegion && (
            <>
              <div className="flex items-baseline gap-2 px-5 pt-4 pb-3">
                <h2 className="text-[15px] font-black text-white">
                  {selectedRegion.name}의 공연
                </h2>
                {hasResults && (
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {shows.length}개
                  </span>
                )}
              </div>

              {loading && <ResultSkeleton />}

              {!loading && error && (
                <div
                  className="mx-5 rounded-2xl py-8 text-center"
                  style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}
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
                    className="mt-3 px-4 py-1.5 rounded-full text-[11px] font-bold"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {!loading && !error && lastChance.length > 0 && (
                <div className="px-5 mb-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="dday-urgent inline-block w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
                    <span className="text-[11px] font-black tracking-[0.18em]" style={{ color: "#f87171" }}>
                      LAST CHANCE
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {lastChance.map((s) => <PerformanceCard key={s.id} show={s} />)}
                  </div>
                </div>
              )}

              {!loading && !error && regular.length > 0 && (
                <div className="px-5 pb-8">
                  <div className="flex flex-col gap-2.5">
                    {regular.map((s) => <PerformanceCard key={s.id} show={s} />)}
                  </div>
                </div>
              )}

              {!loading && !error && shows.length === 0 && (
                <div
                  className="mx-5 rounded-2xl py-10 text-center"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-3xl mb-3">🗺️</p>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                    아직 등록된 공연이 없어요
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                    다른 지역을 탐색해보세요
                  </p>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

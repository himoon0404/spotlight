"use client";

import type { SearchShow } from "@/types/show";
import { PerformanceCard } from "./PerformanceCard";

interface Props {
  shows: SearchShow[];
  similarShows: SearchShow[];
  hasFilters: boolean;
}

export function SearchResults({ shows, similarShows, hasFilters }: Props) {
  // No filters active → show discovery prompt
  if (!hasFilters) {
    return (
      <div className="px-5 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm leading-none">✦</span>
          <span className="text-[13px] font-bold tracking-[0.04em] text-white/90">큐레이터 추천 공연</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {similarShows.map((s) => (
            <PerformanceCard key={s.id} show={s} />
          ))}
        </div>
      </div>
    );
  }

  // Has filters but no results
  if (shows.length === 0) {
    return (
      <div className="px-5 pb-8">
        {/* Empty state */}
        <div className="rounded-2xl px-5 py-6 mb-6 text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-3xl mb-3">🔍</div>
          <p className="text-[13px] font-semibold text-white/80 mb-1">
            조건에 맞는 공연이 부족해요
          </p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            비슷한 공연을 추천해드릴게요
          </p>
        </div>

        {/* Similar shows */}
        {similarShows.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm leading-none">💡</span>
              <span className="text-[13px] font-bold text-white/80">비슷한 공연</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {similarShows.map((s) => (
                <PerformanceCard key={s.id} show={s} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Normal results
  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-bold text-white/90">검색 결과</span>
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          {shows.length}개 공연
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {shows.map((s) => (
          <PerformanceCard key={s.id} show={s} />
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ProcessedShow, ShowTheme } from "@/types/show";
import { PosterCard } from "@/components/home/PosterCard";
import { buildDetailUrl } from "@/app/shows/detail/[id]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KopisItem {
  id: string;
  title: string;
  place: string;
  startDate: string;
  endDate: string;
  poster: string | null;
  genre: string;
  state: string;
  region: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assignTheme(genre: string): ShowTheme {
  const g = genre.toLowerCase();
  if (g.includes("뮤지컬")) return "amber";
  if (g.includes("클래식") || g.includes("오페라")) return "blue";
  if (g.includes("무용") || g.includes("발레") || g.includes("전통")) return "purple";
  if (g.includes("재즈") || g.includes("인디")) return "emerald";
  return "teal";
}

function normalizeGenreLabel(genre: string): string {
  if (genre.includes("뮤지컬")) return "뮤지컬";
  if (genre.includes("클래식") || genre.includes("오페라")) return "클래식";
  if (genre.includes("무용") || genre.includes("발레")) return "무용";
  if (genre.includes("전통")) return "전통예술";
  if (genre.includes("재즈") || genre.includes("인디")) return "재즈";
  if (genre.includes("연극")) return "연극";
  return genre;
}

function calcDday(endDate: string): { ddayLabel: string; isCritical: boolean } | undefined {
  try {
    const parts = endDate.replace(/\./g, "-").split("-");
    if (parts.length < 3) return undefined;
    const end = new Date(`${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`);
    const diff = Math.ceil((end.getTime() - Date.now()) / 86400000);
    if (diff < 0 || diff > 7) return undefined;
    return { ddayLabel: diff === 0 ? "D-DAY" : `D-${diff}`, isCritical: diff <= 3 };
  } catch { return undefined; }
}

function toProcessedShow(item: KopisItem): ProcessedShow {
  const dday = calcDday(item.endDate);
  return {
    id: item.id,
    title: item.title,
    genre: normalizeGenreLabel(item.genre),
    venue: item.place,
    posterUrl: item.poster ?? undefined,
    theme: assignTheme(item.genre),
    period: `${item.startDate} ~ ${item.endDate}`,
    area: item.region || "서울",
    ...(dday ?? {}),
  };
}

// ─── Categories ──────────────────────────────────────────────────────────────

const CURATION_CATEGORIES = [
  {
    id: "after-work",
    emoji: "🌆",
    title: "퇴근 후 가볍게",
    desc: "하루의 피로를 녹여줄",
    reason: "짧고 가볍게 즐길 수 있는 작품으로, 일상의 피로를 잊게 해드릴 거예요.",
    genre: "뮤지컬",
    accentColor: "#f59e0b",
    gradBg: "linear-gradient(135deg, #1a1200 0%, #0c0900 100%)",
    borderColor: "rgba(245,158,11,0.3)",
  },
  {
    id: "first-show",
    emoji: "🎭",
    title: "첫 공연 입문",
    desc: "처음 공연 보는 분께",
    reason: "입문자도 쉽게 빠져드는 스토리와 화려한 무대로 구성했어요.",
    genre: "뮤지컬",
    accentColor: "#34d399",
    gradBg: "linear-gradient(135deg, #001a08 0%, #000e04 100%)",
    borderColor: "rgba(52,211,153,0.3)",
  },
  {
    id: "solo",
    emoji: "🎧",
    title: "혼자 보기 좋은",
    desc: "나만의 감상을 위한",
    reason: "집중해서 즐기기 좋은, 몰입감 높은 작품들로 구성했어요.",
    genre: "연극",
    accentColor: "#a78bfa",
    gradBg: "linear-gradient(135deg, #120820 0%, #080412 100%)",
    borderColor: "rgba(167,139,250,0.3)",
  },
  {
    id: "date",
    emoji: "🌹",
    title: "데이트에 딱",
    desc: "함께여서 더 빛나는",
    reason: "화려한 무대와 감동적인 스토리로 특별한 추억을 선물하세요.",
    genre: "뮤지컬",
    accentColor: "#f87171",
    gradBg: "linear-gradient(135deg, #1a0808 0%, #0f0404 100%)",
    borderColor: "rgba(248,113,113,0.3)",
  },
  {
    id: "rainy",
    emoji: "🌧️",
    title: "비 오는 날",
    desc: "빗소리와 잘 어울리는",
    reason: "잔잔하고 감성적인 선율이 빗소리와 완벽하게 어우러지는 공연이에요.",
    genre: "클래식",
    accentColor: "#60a5fa",
    gradBg: "linear-gradient(135deg, #060f1e 0%, #030a12 100%)",
    borderColor: "rgba(96,165,250,0.3)",
  },
  {
    id: "last-week",
    emoji: "⏰",
    title: "이번 주 놓치면",
    desc: "곧 막이 내려요",
    reason: "마감이 임박해 아쉬움이 클 공연들만 엄선했어요. 지금 바로 확인하세요.",
    genre: "연극",
    accentColor: "#fb923c",
    gradBg: "linear-gradient(135deg, #180800 0%, #0f0500 100%)",
    borderColor: "rgba(251,146,60,0.3)",
  },
] as const;

type CurationCategory = typeof CURATION_CATEGORIES[number];

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  cat, active, onClick,
}: {
  cat: CurationCategory;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-none flex flex-col gap-2.5 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.97]"
      style={{
        width: 136,
        background: active ? cat.gradBg : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? cat.borderColor : "rgba(255,255,255,0.08)"}`,
        boxShadow: active ? `0 0 24px ${cat.borderColor}55` : "none",
      }}
    >
      <span className="text-2xl leading-none">{cat.emoji}</span>
      <div>
        <p
          className="text-[13px] font-bold leading-tight mb-0.5"
          style={{ color: active ? cat.accentColor : "rgba(255,255,255,0.8)" }}
        >
          {cat.title}
        </p>
        <p
          className="text-[11px] leading-tight"
          style={{ color: active ? `${cat.accentColor}90` : "rgba(255,255,255,0.3)" }}
        >
          {cat.desc}
        </p>
      </div>
      <div
        className="w-full h-px rounded-full transition-all"
        style={{
          background: active
            ? `linear-gradient(to right, ${cat.accentColor}, transparent)`
            : "transparent",
        }}
      />
    </button>
  );
}

// ─── Expanded Panel ────────────────────────────────────────────────────────────

function ExpandedPanel({
  cat, shows, loading, onShowClick,
}: {
  cat: CurationCategory;
  shows: ProcessedShow[];
  loading: boolean;
  onShowClick: (show: ProcessedShow) => void;
}) {
  return (
    <div
      className="mx-5 mt-3 rounded-2xl overflow-hidden"
      style={{
        background: cat.gradBg,
        border: `1px solid ${cat.borderColor}`,
        boxShadow: `0 4px 32px ${cat.borderColor}33`,
      }}
    >
      {/* Panel header */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ borderBottom: `1px solid ${cat.borderColor}55` }}
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl leading-none mt-0.5">{cat.emoji}</span>
          <div className="flex-1">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-0.5"
              style={{ color: `${cat.accentColor}80` }}
            >
              큐레이터 추천
            </p>
            <h3
              className="text-[16px] font-black"
              style={{ color: cat.accentColor }}
            >
              {cat.title}
            </h3>
          </div>
        </div>

        {/* Why recommend */}
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${cat.borderColor}44`,
          }}
        >
          <span
            className="text-[10px] flex-none mt-0.5 font-bold"
            style={{ color: cat.accentColor }}
          >
            ✦
          </span>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <span style={{ color: cat.accentColor }} className="font-semibold">
              왜 추천하나요?{" "}
            </span>
            {cat.reason}
          </p>
        </div>
      </div>

      {/* Shows */}
      <div className="pt-3 pb-4">
        {loading ? (
          <div className="flex gap-3 px-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-none rounded-2xl animate-pulse"
                style={{
                  width: 116,
                  aspectRatio: "2/3",
                  background: "rgba(255,255,255,0.05)",
                }}
              />
            ))}
          </div>
        ) : shows.length > 0 ? (
          <div
            className="flex gap-3 overflow-x-auto px-4 pb-1"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {shows.map((show) => (
              <div key={show.id} className="flex-none w-[116px]">
                <PosterCard show={show} onClick={() => onShowClick(show)} />
              </div>
            ))}
            <div className="flex-none w-1" aria-hidden />
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <p
              className="text-[13px]"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              현재 해당하는 공연이 없어요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CurationSection({ area }: { area?: string }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showsCache, setShowsCache] = useState<Record<string, ProcessedShow[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 지역이 바뀌면 캐시 초기화 (열려 있던 패널도 닫음)
  const prevAreaRef = React.useRef(area);
  if (prevAreaRef.current !== area) {
    prevAreaRef.current = area;
    if (Object.keys(showsCache).length > 0) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setShowsCache({});
      setActiveId(null);
    }
  }

  const handleSelect = useCallback(
    async (cat: CurationCategory) => {
      if (activeId === cat.id) {
        setActiveId(null);
        return;
      }
      setActiveId(cat.id);
      // 캐시 키에 지역 포함 — 지역이 바뀌면 새로 fetch
      const cacheKey = `${cat.id}__${area ?? ""}`;
      if (showsCache[cacheKey] !== undefined) return;
      setLoadingId(cat.id);
      try {
        const qs = new URLSearchParams({ genre: cat.genre, rows: "6" });
        if (area) qs.set("region", area);
        const r = await fetch(`/api/kopis?${qs.toString()}`);
        const d: { items?: KopisItem[] } = await r.json();
        setShowsCache((prev) => ({
          ...prev,
          [cacheKey]: (d.items ?? []).slice(0, 4).map(toProcessedShow),
        }));
      } finally {
        setLoadingId(null);
      }
    },
    [activeId, showsCache, area],
  );

  const activeCategory = CURATION_CATEGORIES.find((c) => c.id === activeId);
  const activeCacheKey = activeId ? `${activeId}__${area ?? ""}` : null;

  return (
    <section className="mt-8">
      {/* 헤더 */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm leading-none">✦</span>
          <span className="text-[15px] font-bold tracking-[0.04em] text-white/90">
            오늘의 큐레이션
          </span>
        </div>
        <p
          className="text-[12px]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          AI가 취향과 분위기를 분석해 골라봤어요
        </p>
      </div>

      {/* 카테고리 카드 가로 스크롤 */}
      <div
        className="flex gap-3 overflow-x-auto px-5 pb-2"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {CURATION_CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            active={activeId === cat.id}
            onClick={() => handleSelect(cat)}
          />
        ))}
        <div className="flex-none w-1" aria-hidden />
      </div>

      {/* 펼쳐진 큐레이션 패널 */}
      {activeCategory && (
        <ExpandedPanel
          cat={activeCategory}
          shows={activeCacheKey ? (showsCache[activeCacheKey] ?? []) : []}
          loading={loadingId === activeId}
          onShowClick={(show) => router.push(buildDetailUrl(show))}
        />
      )}
    </section>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SearchShow } from "@/types/show";

const THEME: Record<string, { accent: string; bg: string; badgeBg: string; badgeBorder: string }> = {
  amber:   { accent: "#fbbf24", bg: "rgba(251,191,36,0.08)",  badgeBg: "rgba(251,191,36,0.12)",  badgeBorder: "rgba(251,191,36,0.35)"  },
  teal:    { accent: "#2dd4bf", bg: "rgba(45,212,191,0.08)",  badgeBg: "rgba(45,212,191,0.12)",  badgeBorder: "rgba(45,212,191,0.35)"  },
  emerald: { accent: "#34d399", bg: "rgba(52,211,153,0.08)",  badgeBg: "rgba(52,211,153,0.12)",  badgeBorder: "rgba(52,211,153,0.35)"  },
  blue:    { accent: "#60a5fa", bg: "rgba(96,165,250,0.08)",  badgeBg: "rgba(96,165,250,0.15)",  badgeBorder: "rgba(96,165,250,0.4)"   },
  purple:  { accent: "#c084fc", bg: "rgba(192,132,252,0.08)", badgeBg: "rgba(192,132,252,0.15)", badgeBorder: "rgba(192,132,252,0.4)"  },
  red:     { accent: "#f87171", bg: "rgba(239,68,68,0.08)",   badgeBg: "rgba(239,68,68,0.15)",   badgeBorder: "rgba(239,68,68,0.5)"    },
};

const GENRE_EMOJI: Record<string, string> = {
  뮤지컬: "🎭", 연극: "🎪", 재즈: "🎷", 클래식: "🎻",
  인디음악: "🎸", 무용: "💃", 전통예술: "🪷",
};

type ImgState = "loading" | "loaded" | "error";

function urgencyLevel(dday?: number): "critical" | "high" | "normal" | null {
  if (dday === undefined) return null;
  if (dday <= 3)  return "critical";
  if (dday <= 7)  return "high";
  return "normal";
}

interface Props {
  show: SearchShow;
}

export function PerformanceCard({ show }: Props) {
  const posterSrc = show.posterUrl || show.poster || "";
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgState, setImgState] = useState<ImgState>(posterSrc ? "loading" : "error");

  useEffect(() => {
    if (!posterSrc) {
      console.warn(`[Poster] missing — "${show.title}" | id: ${show.id}`);
      setImgState("error");
      return;
    }
    setImgState("loading");
    const img = imgRef.current;
    if (img?.complete) {
      setImgState(img.naturalWidth > 0 ? "loaded" : "error");
    }
  }, [posterSrc, show.title, show.id]);

  const handleLoad = useCallback(() => setImgState("loaded"), []);
  const handleError = useCallback(() => {
    console.warn(`[Poster] load failed — "${show.title}" | url: ${posterSrc}`);
    setImgState("error");
  }, [show.title, posterSrc]);

  const t      = THEME[show.theme] ?? THEME.emerald;
  const level  = urgencyLevel(show.dday);
  const emoji  = GENRE_EMOJI[show.genre] ?? "🎭";
  const endDate = show.period.split(" – ")[1] ?? show.period;
  const loaded = imgState === "loaded";
  const failed = imgState === "error";

  const urgencyText =
    level === "critical" ? "마감 임박" :
    level === "high"     ? "이번 주까지" :
    null;

  return (
    <div
      className="relative flex overflow-hidden rounded-2xl cursor-pointer active:scale-[0.985] transition-transform"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", minHeight: 116 }}
    >
      {/* ── 포스터 영역 ──────────────────────────────────────────── */}
      <div
        className="flex-none relative overflow-hidden"
        style={{
          width: 86,
          background: `linear-gradient(160deg, ${t.bg} 0%, rgba(12,12,12,0.9) 100%)`,
        }}
      >
        {/* Fallback emoji — only when no URL or load failed */}
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl leading-none select-none">{emoji}</span>
            <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color: `${t.accent}66` }}>
              {show.genre}
            </span>
          </div>
        )}

        {/* Poster image */}
        {posterSrc && !failed && (
          <img
            ref={imgRef}
            key={posterSrc}
            src={posterSrc}
            alt={show.title}
            onLoad={handleLoad}
            onError={handleError}
            className="absolute inset-0 w-full h-full transition-opacity duration-500"
            style={{ objectFit: "cover", opacity: loaded ? 1 : 0 }}
          />
        )}

        {/* 마감 임박 오버레이 */}
        {level === "critical" && (
          <div
            className="absolute bottom-0 left-0 right-0 py-1 text-center z-10"
            style={{ background: "rgba(239,68,68,0.82)" }}
          >
            <span className="text-[8px] font-black tracking-widest text-white">마감</span>
          </div>
        )}

        {/* 우측 페이드 */}
        <div className="absolute inset-y-0 right-0 w-4 z-10" style={{ background: "linear-gradient(to right, transparent, rgba(12,12,12,0.6))" }} />
      </div>

      {/* ── 정보 영역 ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
              style={{ color: t.accent, background: t.badgeBg, border: `1px solid ${t.badgeBorder}` }}
            >
              {show.genre}
            </span>
            {show.isCuratorPick && (
              <span className="text-[9px] font-bold" style={{ color: "#fbbf24" }}>✦ PICK</span>
            )}
          </div>

          <h3
            className="text-white font-bold text-[14px] leading-snug mb-1"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {show.title}
          </h3>

          <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
            📍 {show.venue}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>
              ~ {endDate}
            </span>
            {show.viewers && (
              <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                👥 {show.viewers}
              </span>
            )}
          </div>

          {show.ddayLabel ? (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest ${show.isCritical ? "dday-critical" : level === "critical" || level === "high" ? "dday-urgent" : ""}`}
              style={{
                background: level === "critical" ? "rgba(239,68,68,0.18)" : level === "high" ? "rgba(251,146,60,0.15)" : t.badgeBg,
                border:     level === "critical" ? "1px solid rgba(239,68,68,0.55)" : level === "high" ? "1px solid rgba(251,146,60,0.4)" : `1px solid ${t.badgeBorder}`,
                color:      level === "critical" ? "#f87171" : level === "high" ? "#fb923c" : t.accent,
              }}
            >
              {urgencyText ?? show.ddayLabel}
            </span>
          ) : show.saveCount ? (
            <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              🔖 {show.saveCount.toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

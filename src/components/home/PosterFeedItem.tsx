"use client";

import { useState, useCallback } from "react";
import type { ProcessedShow } from "@/types/show";
import { PosterImage } from "@/components/ui/PosterImage";

const THEME_BG: Record<string, string> = {
  teal:    "linear-gradient(170deg, #0d2a2a 0%, #061818 45%, #030e0e 100%)",
  emerald: "linear-gradient(170deg, #0d2818 0%, #061408 45%, #030c04 100%)",
  amber:   "linear-gradient(170deg, #251508 0%, #150c00 45%, #0c0800 100%)",
  blue:    "linear-gradient(170deg, #071830 0%, #030c1e 45%, #02060e 100%)",
  purple:  "linear-gradient(170deg, #18082e 0%, #0e041e 45%, #070210 100%)",
  red:     "linear-gradient(170deg, #3a0c0c 0%, #200606 45%, #0e0202 100%)",
};

interface Props {
  show: ProcessedShow;
  index: number;
}

export function PosterFeedItem({ show, index }: Props) {
  const [loaded, setLoaded] = useState(false);

  const handleLoaded = useCallback(() => setLoaded(true), []);

  const bg = THEME_BG[show.theme] ?? THEME_BG.emerald;

  return (
    /* Full-height scroll-snap container — centers the card */
    <div
      className="relative flex-none w-full flex items-center justify-center overflow-hidden"
      style={{
        height: "100dvh",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        background: "#070707",
      }}
    >
      {/* ── Blurred background: same poster, very dark — rendered once, fades in with card */}
      {show.posterUrl && (
        <img
          src={show.posterUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-700"
          style={{
            objectFit: "cover",
            filter: "blur(48px) brightness(0.15) saturate(0.45)",
            transform: "scale(1.18)",
            zIndex: 0,
            opacity: loaded ? 1 : 0,
          }}
        />
      )}

      {/* Vignette over blurred bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.7) 100%)",
          zIndex: 1,
        }}
      />

      {/* ── Poster card ──────────────────────────────────────────────────────── */}
      {/*
          Width is the min of:
            · 90vw            — fills most of a narrow phone
            · 380px           — hard max for wide screens / tablets
            · (100dvh-200px)×2/3 — keeps card fully visible if screen is short
          Height is derived from width via aspect-ratio 2:3.
      */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: "min(90vw, 380px, calc((100dvh - 200px) * 2 / 3))",
          aspectRatio: "2 / 3",
          zIndex: 2,
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07)",
        }}
      >
        {/* Theme gradient fill shown while poster loads (or on fallback) */}
        <div className="absolute inset-0" style={{ background: bg }} />

        {/* Poster image (shimmer / fallback / cover 처리는 PosterImage 내부) */}
        <PosterImage
          src={show.posterUrl}
          alt={show.title}
          genre={show.genre}
          onLoaded={handleLoaded}
        />

        {/* ── Text overlay — bottom 30% of card only ─────────────────────── */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "30%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.78) 45%, transparent 100%)",
          }}
        />
        <div className="absolute bottom-0 inset-x-0 px-4 pb-4">
          {/* Genre + urgency chips */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-bold tracking-widest uppercase"
              style={{
                color: "rgba(255,255,255,0.55)",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {show.genre}
            </span>

            {show.isCritical && (
              <span
                className="dday-critical px-2 py-0.5 rounded-full text-[11px] font-black"
                style={{
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.18)",
                  border: "1px solid rgba(239,68,68,0.35)",
                }}
              >
                마감 임박
              </span>
            )}

            {!show.isCritical && show.dday !== undefined && show.dday <= 7 && (
              <span
                className="dday-urgent px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={{
                  color: "#fbbf24",
                  background: "rgba(251,191,36,0.14)",
                  border: "1px solid rgba(251,191,36,0.3)",
                }}
              >
                이번 주까지
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            className="font-black leading-tight text-white mb-1"
            style={{ fontSize: "16px" }}
          >
            {show.title}
          </h2>

          {/* Venue */}
          <p className="text-[13px] truncate mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            📍 {show.venue}
          </p>

          {/* D-day + rank + period */}
          <div className="flex flex-wrap items-center gap-2">
            {show.ddayLabel && (
              <span
                className={`px-2.5 py-1 rounded-full text-[12px] font-black tracking-widest ${
                  show.isCritical
                    ? "dday-critical"
                    : show.dday !== undefined && show.dday <= 7
                    ? "dday-urgent"
                    : ""
                }`}
                style={{
                  background: "rgba(251,191,36,0.16)",
                  border: "1px solid rgba(251,191,36,0.38)",
                  color: "#fbbf24",
                }}
              >
                {show.ddayLabel}
              </span>
            )}

            {show.rank && (
              <span className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.42)" }}>
                🔥 {show.rank}위
              </span>
            )}

            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              {show.period}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll hint — first item only */}
      {index === 0 && (
        <div
          className="absolute bottom-[84px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none"
          style={{ zIndex: 3, color: "rgba(255,255,255,0.2)" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
          <span className="text-[11px] font-medium tracking-wider">스크롤하여 더 보기</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import type { CardShow } from "@/types/show";
import { PosterImage } from "@/components/ui/PosterImage";

const THEME_BG: Record<string, string> = {
  teal:    "linear-gradient(160deg, #0d2a2a 0%, #041414 100%)",
  emerald: "linear-gradient(160deg, #0d2818 0%, #041208 100%)",
  amber:   "linear-gradient(160deg, #251508 0%, #120900 100%)",
  blue:    "linear-gradient(160deg, #071830 0%, #03091a 100%)",
  purple:  "linear-gradient(160deg, #18082e 0%, #0c0418 100%)",
  red:     "linear-gradient(160deg, #3a0c0c 0%, #1c0404 100%)",
};

const RANK_STYLE = [
  { color: "#fbbf24",                bg: "rgba(251,191,36,0.14)",  border: "rgba(251,191,36,0.45)"  },
  { color: "rgba(203,213,225,0.85)", bg: "rgba(203,213,225,0.09)", border: "rgba(203,213,225,0.3)"  },
  { color: "rgba(251,146,60,0.8)",   bg: "rgba(251,146,60,0.09)",  border: "rgba(251,146,60,0.28)" },
];

interface Props {
  show: CardShow;
  onClick?: () => void;
}

export function PosterCard({ show, onClick }: Props) {
  const [loaded, setLoaded] = useState(false);

  const bg   = THEME_BG[show.theme] ?? THEME_BG.emerald;
  const rank = show.rank ? RANK_STYLE[(show.rank - 1) % 3] : null;

  const handleLoaded = useCallback(() => setLoaded(true), []);

  return (
    <div
      onClick={onClick}
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer
                 active:scale-[0.97] transition-transform"
      style={{ aspectRatio: "2 / 3" }}
    >
      {/* ── Dark gradient background ────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ background: bg }} />

      {/* ── Poster image (shimmer / fallback / cover 처리는 PosterImage 내부) ── */}
      <PosterImage
        src={show.posterUrl}
        alt={show.title}
        genre={show.genre}
        onLoaded={handleLoaded}
      />

      {/* ── Rank badge ───────────────────────────────────────────────────────── */}
      {rank && show.rank && (
        <div className="absolute top-2 left-2 z-10">
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-black"
            style={{
              color: rank.color,
              background: rank.bg,
              border: `1px solid ${rank.border}`,
            }}
          >
            #{show.rank}
          </span>
        </div>
      )}

      {/* ── D-day badge ──────────────────────────────────────────────────────── */}
      {show.ddayLabel && (
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black tracking-widest ${
              show.isCritical
                ? "dday-critical"
                : show.dday !== undefined && show.dday <= 7
                ? "dday-urgent"
                : ""
            }`}
            style={{
              background: "rgba(251,191,36,0.18)",
              border: "1px solid rgba(251,191,36,0.45)",
              color: "#fbbf24",
            }}
          >
            {show.ddayLabel}
          </span>
        </div>
      )}

      {/* ── Bottom gradient ───────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{
          height: "32%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.78) 45%, transparent 100%)",
        }}
      />

      {/* ── Text overlay ─────────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 px-2.5 pb-2.5 z-20">
        <span
          className="block mb-1 uppercase tracking-widest"
          style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.45)" }}
        >
          {show.genre}
        </span>

        <p
          className="text-white font-bold leading-snug mb-0.5"
          style={{
            fontSize: "16px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {show.title}
        </p>

        <p
          className="truncate"
          style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}
        >
          {show.venue}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import type { CardShow } from "@/types/show";
import { PosterImage } from "@/components/ui/PosterImage";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

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

function SmallHeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
      fill={filled ? "#f87171" : "none"}
      stroke={filled ? "#f87171" : "rgba(255,255,255,0.7)"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

interface Props {
  show: CardShow;
  onClick?: () => void;
  showHeart?: boolean;
}

export function PosterCard({ show, onClick, showHeart = true }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [isFav, setIsFav]   = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(show.id));
  }, [show.id]);

  const bg   = THEME_BG[show.theme] ?? THEME_BG.emerald;
  const rank = show.rank ? RANK_STYLE[(show.rank - 1) % 3] : null;

  const handleLoaded = useCallback(() => setLoaded(true), []);

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    const result = toggleFavorite({
      id:        show.id,
      title:     show.title,
      genre:     show.genre,
      venue:     show.venue,
      posterUrl: show.posterUrl,
      theme:     show.theme,
    });
    setIsFav(result);
  }

  return (
    <div
      onClick={onClick}
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer
                 active:scale-[0.97] transition-transform"
      style={{ aspectRatio: "2 / 3" }}
    >
      {/* ── Dark gradient background ── */}
      <div className="absolute inset-0" style={{ background: bg }} />

      {/* ── Poster image ── */}
      <PosterImage
        src={show.posterUrl}
        alt={show.title}
        genre={show.genre}
        onLoaded={handleLoaded}
      />

      {/* ── Rank badge ── */}
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

      {/* ── D-day badge ── */}
      {show.ddayLabel && (
        <div className={`absolute top-2 z-10 ${showHeart ? "right-9" : "right-2"}`}>
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

      {/* ── Heart button ── */}
      {showHeart && (
        <button
          onClick={handleHeartClick}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{
            background: isFav ? "rgba(248,113,113,0.15)" : "rgba(0,0,0,0.45)",
            border: isFav ? "1px solid rgba(248,113,113,0.4)" : "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(4px)",
          }}
          aria-label={isFav ? "관심 해제" : "관심 등록"}
        >
          <SmallHeartIcon filled={isFav} />
        </button>
      )}

      {/* ── Bottom gradient ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{
          height: "32%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.78) 45%, transparent 100%)",
        }}
      />

      {/* ── Text overlay ── */}
      <div className="absolute bottom-0 inset-x-0 px-3 pb-3 z-20">
        <span
          className="block mb-1 uppercase tracking-widest"
          style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}
        >
          {show.genre}
        </span>

        <p
          className="text-white font-bold leading-snug mb-1"
          style={{
            fontSize: "15px",
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
          style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)" }}
        >
          {show.venue}
        </p>
      </div>
    </div>
  );
}

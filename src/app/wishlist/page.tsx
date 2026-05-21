"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import type { FavoriteShow } from "@/lib/favorites";
import { PosterImage } from "@/components/ui/PosterImage";

// ─── Theme ───────────────────────────────────────────────────────────────────

const THEME_BG: Record<string, string> = {
  teal:    "linear-gradient(160deg, #0d2a2a 0%, #041414 100%)",
  emerald: "linear-gradient(160deg, #0d2818 0%, #041208 100%)",
  amber:   "linear-gradient(160deg, #251508 0%, #120900 100%)",
  blue:    "linear-gradient(160deg, #071830 0%, #03091a 100%)",
  purple:  "linear-gradient(160deg, #18082e 0%, #0c0418 100%)",
  red:     "linear-gradient(160deg, #3a0c0c 0%, #1c0404 100%)",
};

// ─── Heart button ─────────────────────────────────────────────────────────────

function HeartFilledIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill="#f87171" stroke="#f87171" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── Favorite card ────────────────────────────────────────────────────────────

function FavoriteCard({
  show,
  onRemove,
  onClick,
}: {
  show: FavoriteShow;
  onRemove: (id: string) => void;
  onClick: () => void;
}) {
  const bg = THEME_BG[show.theme] ?? THEME_BG.emerald;

  return (
    <div
      onClick={onClick}
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
      style={{ aspectRatio: "2 / 3" }}
    >
      <div className="absolute inset-0" style={{ background: bg }} />

      <PosterImage
        src={show.posterUrl}
        alt={show.title}
        genre={show.genre}
        onLoaded={() => {}}
      />

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(show.id); }}
        className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90"
        style={{
          background: "rgba(248,113,113,0.15)",
          border: "1px solid rgba(248,113,113,0.4)",
          backdropFilter: "blur(4px)",
        }}
        aria-label="관심 해제"
      >
        <HeartFilledIcon />
      </button>

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{
          height: "32%",
          background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.78) 45%, transparent 100%)",
        }}
      />

      {/* Text overlay */}
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
            fontSize: "15px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {show.title}
        </p>
        <p className="truncate" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
          {show.venue}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const router  = useRouter();
  const [favorites, setFavorites] = useState<FavoriteShow[]>([]);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setMounted(true);
  }, []);

  const handleRemove = useCallback((id: string) => {
    const show = favorites.find((f) => f.id === id);
    if (show) {
      toggleFavorite(show);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    }
  }, [favorites]);

  function handleCardClick(show: FavoriteShow) {
    const params = new URLSearchParams({
      title: show.title,
      genre: show.genre,
      venue: show.venue,
      period: show.period ?? "",
      theme: show.theme,
      ...(show.posterUrl && { poster: show.posterUrl }),
    });
    router.push(`/shows/detail/${show.id}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white lg:ml-[240px]">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-5 pt-5 pb-4 bg-[#0c0c0c]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="lg:max-w-4xl lg:mx-auto">
          <h1 className="text-[22px] font-black text-white mb-0.5">관심 공연</h1>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.42)" }}>
            저장한 공연을 기반으로 더 정확한 추천을 제공합니다
          </p>
        </div>
      </header>

      <main className="pb-28 lg:pb-12 px-5 pt-5 lg:max-w-4xl lg:mx-auto">

        {/* AI 활용 배너 */}
        <div
          className="rounded-2xl px-4 py-4 mb-6 flex items-center gap-3.5"
          style={{
            background: "linear-gradient(135deg, #1a0a2e 0%, #0f0618 100%)",
            border: "1px solid rgba(167,139,250,0.22)",
          }}
        >
          <span className="text-xl flex-none">✦</span>
          <div>
            <p className="text-[13px] font-bold mb-0.5" style={{ color: "rgba(167,139,250,0.92)" }}>
              관심 공연이 AI 추천의 기반이 됩니다
            </p>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.38)" }}>
              저장할수록 취향에 맞는 공연을 더 정확하게 추천해드릴게요
            </p>
          </div>
        </div>

        {!mounted ? null : favorites.length === 0 ? (
          /* Empty state */
          <div
            className="rounded-2xl py-16 flex flex-col items-center gap-4 text-center"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-5xl">🎭</span>
            <div>
              <p className="text-[16px] font-bold text-white mb-2">
                아직 관심 공연이 없습니다
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>
                마음에 드는 공연의 하트를 눌러<br />관심 공연으로 저장해보세요
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-2 px-6 py-3 rounded-full text-[13px] font-bold transition-all active:scale-95"
              style={{
                background: "rgba(251,191,36,0.12)",
                border: "1px solid rgba(251,191,36,0.38)",
                color: "#fbbf24",
              }}
            >
              공연 둘러보기 →
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2.5 mb-4">
              <span className="text-[17px] font-black text-white">저장된 공연</span>
              <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.42)" }}>
                {favorites.length}개
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {favorites.map((show) => (
                <FavoriteCard
                  key={show.id}
                  show={show}
                  onRemove={handleRemove}
                  onClick={() => handleCardClick(show)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

"use client";

import { GENRES, EXTRA_TAGS } from "@/lib/searchMockData";

interface Props {
  selectedGenre: string | null;
  selectedSubGenre: string | null;
  extraTags: string[];
  onGenreSelect: (g: string | null) => void;
  onSubGenreSelect: (s: string | null) => void;
  onExtraTagToggle: (tag: string) => void;
  onReset: () => void;
}

export function GenreDeepFilter({
  selectedGenre,
  selectedSubGenre,
  extraTags,
  onGenreSelect,
  onSubGenreSelect,
  onExtraTagToggle,
  onReset,
}: Props) {
  const subGenres = selectedGenre ? GENRES[selectedGenre]?.subGenres ?? [] : [];
  const showSubGenres = selectedGenre !== null;
  const showExtraTags = selectedSubGenre !== null;
  const hasAny = selectedGenre !== null || extraTags.length > 0;

  return (
    <div className="px-5 mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm leading-none">🎭</span>
          <span className="text-[13px] font-bold tracking-[0.04em] text-white/90">장르로 탐색</span>
        </div>
        {hasAny && (
          <button
            onClick={onReset}
            className="text-[11px] transition-colors"
            style={{ color: "rgba(251,191,36,0.7)" }}
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Active filter breadcrumb */}
      {hasAny && (
        <div
          className="flex items-center gap-1.5 mb-3 flex-wrap text-[11px]"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {selectedGenre && (
            <span style={{ color: "#fbbf24" }}>{GENRES[selectedGenre]?.emoji} {selectedGenre}</span>
          )}
          {selectedSubGenre && (
            <>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>›</span>
              <span style={{ color: "rgba(251,191,36,0.75)" }}>{selectedSubGenre}</span>
            </>
          )}
          {extraTags.map((t) => (
            <span key={t} style={{ color: "rgba(251,191,36,0.55)" }}>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>›</span> {t}
            </span>
          ))}
        </div>
      )}

      {/* ── Level 1: Main genres ── */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(GENRES).map(([name, { emoji }]) => {
          const active = selectedGenre === name;
          return (
            <button
              key={name}
              onClick={() => {
                if (active) {
                  onGenreSelect(null);
                  onSubGenreSelect(null);
                } else {
                  onGenreSelect(name);
                  onSubGenreSelect(null);
                }
              }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
              style={
                active
                  ? { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.45)" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              <span className="text-xl leading-none">{emoji}</span>
              <span
                className="text-[10px] font-semibold tracking-tight"
                style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.6)" }}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Level 2: Sub-genres (animated reveal) ── */}
      <div
        style={{
          maxHeight: showSubGenres ? "200px" : "0px",
          opacity: showSubGenres ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.25s ease",
        }}
      >
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            세부 장르
          </p>
          <div className="flex flex-wrap gap-2">
            {subGenres.map((s) => {
              const active = selectedSubGenre === s;
              return (
                <button
                  key={s}
                  onClick={() => onSubGenreSelect(active ? null : s)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={
                    active
                      ? { background: "rgba(255,255,255,0.9)", color: "#0c0c0c", fontWeight: "700" }
                      : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Level 3: Extra tag filters (animated reveal) ── */}
      <div
        style={{
          maxHeight: showExtraTags ? "160px" : "0px",
          opacity: showExtraTags ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease 0.05s, opacity 0.25s ease 0.05s",
        }}
      >
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            추가 필터
          </p>
          <div className="flex flex-wrap gap-2">
            {EXTRA_TAGS.map((tag) => {
              const active = extraTags.includes(tag);
              const isUrgent = tag === "마감 임박";
              return (
                <button
                  key={tag}
                  onClick={() => onExtraTagToggle(tag)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={
                    active
                      ? isUrgent
                        ? { background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.45)" }
                        : { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.4)" }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {isUrgent ? "🔴 " : ""}{tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

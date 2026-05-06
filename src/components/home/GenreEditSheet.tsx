"use client";

import { useState, useEffect } from "react";
import { setUserPrefs } from "@/lib/userPrefs";
import type { UserPrefs } from "@/lib/userPrefs";

const ALL_GENRES = ["뮤지컬", "연극", "재즈", "클래식", "인디음악", "무용", "전통예술"];
const GENRE_EMOJI: Record<string, string> = {
  뮤지컬: "🎭", 연극: "🎪", 재즈: "🎷", 클래식: "🎻",
  인디음악: "🎸", 무용: "💃", 전통예술: "🪷",
};

interface Props {
  prefs: UserPrefs;
  onClose: () => void;
  onSave: (updated: UserPrefs) => void;
}

export function GenreEditSheet({ prefs, onClose, onSave }: Props) {
  const [selected, setSelected] = useState<string[]>(prefs.genres);

  // 시트 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function toggle(g: string) {
    setSelected((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function save() {
    const updated: UserPrefs = { ...prefs, genres: selected };
    setUserPrefs(updated);
    onSave(updated);
  }

  const changed =
    selected.length !== prefs.genres.length ||
    selected.some((g) => !prefs.genres.includes(g));

  return (
    <>
      {/* 딤 오버레이 */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:left-[240px] rounded-t-3xl px-6 pt-4 pb-10"
        style={{
          background: "#181818",
          borderTop: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* 드래그 핸들 */}
        <div className="w-9 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.18)" }} />

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[17px] font-black text-white">관심 장르 수정</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-label="닫기"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-[13px] mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>
          선택한 장르 기준으로 맞춤 추천이 바뀝니다
        </p>

        {/* 장르 그리드 */}
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {ALL_GENRES.map((g) => {
            const active = selected.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggle(g)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95"
                style={
                  active
                    ? { background: "rgba(251,191,36,0.14)", border: "1.5px solid rgba(251,191,36,0.55)" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                <span className="text-xl leading-none">{GENRE_EMOJI[g]}</span>
                <span
                  className="text-[9px] font-bold"
                  style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.5)" }}
                >
                  {g.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>

        {/* 선택 현황 */}
        <p className="text-[11px] text-center mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
          {selected.length === 0
            ? "장르를 선택하지 않으면 전체 공연이 추천됩니다"
            : `${selected.join(", ")} 선택됨`}
        </p>

        {/* 저장 버튼 */}
        <button
          onClick={save}
          disabled={!changed}
          className="w-full py-4 rounded-2xl text-[15px] font-black tracking-wide transition-opacity"
          style={{
            background: changed ? "#fbbf24" : "rgba(251,191,36,0.25)",
            color: changed ? "#0c0c0c" : "rgba(255,255,255,0.3)",
          }}
        >
          {changed ? "저장하기" : "변경 사항 없음"}
        </button>
      </div>
    </>
  );
}

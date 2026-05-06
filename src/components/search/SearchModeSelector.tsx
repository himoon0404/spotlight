"use client";

import { GENRES } from "@/lib/searchMockData";
import { MAINLAND_PATH, JEJU_PATH } from "./KoreaMap";

export type SearchMode = "map" | "genre";

interface Props {
  activeMode: SearchMode | null;
  onSelect: (mode: SearchMode) => void;
}

// ── 모드 카드 미니 지도 미리보기 ──────────────────────────────────────────────

const MINI_DOTS = [
  { cx: 123, cy: 97,  hot: true  }, // 서울
  { cx: 158, cy: 203, hot: false }, // 대전
  { cx: 261, cy: 245, hot: false }, // 대구
  { cx: 113, cy: 307, hot: false }, // 광주
  { cx: 293, cy: 306, hot: true  }, // 부산
  { cx:  88, cy: 462, hot: false }, // 제주
];

function MiniKoreaMap({ active }: { active: boolean }) {
  const stroke  = active ? "rgba(251,191,36,0.55)" : "rgba(96,165,250,0.4)";
  const fill    = active ? "rgba(251,191,36,0.04)"  : "rgba(96,165,250,0.05)";
  const dotFill = active ? "#fbbf24" : "#60a5fa";
  const glow    = active ? "rgba(251,191,36,0.9)"   : "rgba(96,165,250,0.75)";

  return (
    <div style={{ height: 88, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 380 510" style={{ width: 52, height: 70 }}>
        <path d={MAINLAND_PATH} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        <path d={JEJU_PATH}     fill={fill} stroke={stroke} strokeWidth="2" />
        {MINI_DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.cx} cy={d.cy}
            r={d.hot ? 10 : 7}
            fill={dotFill}
            style={{ filter: `drop-shadow(0 0 ${d.hot ? 8 : 5}px ${glow})` }}
          />
        ))}
      </svg>
    </div>
  );
}

// ── 모드 카드 미니 장르 그리드 ────────────────────────────────────────────────

function MiniGenreGrid({ active }: { active: boolean }) {
  const entries = Object.entries(GENRES);
  const border  = active ? "rgba(192,132,252,0.45)" : "rgba(192,132,252,0.18)";
  const bg      = active ? "rgba(192,132,252,0.12)" : "rgba(192,132,252,0.06)";
  const color   = active ? "rgba(216,180,254,0.9)"  : "rgba(255,255,255,0.4)";

  return (
    <div style={{ height: 88, display: "flex", alignItems: "center", padding: "0 2px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, width: "100%" }}>
        {entries.map(([name, { emoji }]) => (
          <div key={name} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "5px 0", borderRadius: 8, background: bg, border: `1px solid ${border}`,
          }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>{emoji}</span>
            <span style={{ fontSize: 7.5, color, fontWeight: 600 }}>{name.slice(0, 2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 개별 모드 카드 ────────────────────────────────────────────────────────────

interface CardProps {
  title: string;
  description: string;
  cta: string;
  isActive: boolean;
  onClick: () => void;
  visual: React.ReactNode;
}

function ModeCard({ title, description, cta, isActive, onClick, visual }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-stretch text-left rounded-2xl transition-all duration-200"
      style={{
        padding: "12px 12px 14px",
        background: isActive ? "rgba(251,191,36,0.07)" : "rgba(255,255,255,0.04)",
        border: isActive
          ? "1.5px solid rgba(251,191,36,0.5)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {visual}
      <p className="text-[13px] font-bold leading-tight mb-1.5"
        style={{ color: isActive ? "#fbbf24" : "rgba(255,255,255,0.9)" }}>
        {title}
      </p>
      <p className="text-[10px] leading-relaxed mb-3"
        style={{ color: "rgba(255,255,255,0.38)" }}>
        {description}
      </p>
      <div
        className="flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-bold tracking-wide"
        style={
          isActive
            ? { background: "rgba(251,191,36,0.18)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.4)" }
            : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.09)" }
        }
      >
        {cta} →
      </div>
    </button>
  );
}

// ── 내보내기 ──────────────────────────────────────────────────────────────────

export function SearchModeSelector({ activeMode, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      <ModeCard
        title="지도에서 찾기"
        description="지역과 공연장 위치를 기준으로 공연을 찾아요"
        cta="지도 열기"
        isActive={activeMode === "map"}
        onClick={() => onSelect("map")}
        visual={<MiniKoreaMap active={activeMode === "map"} />}
      />
      <ModeCard
        title="장르로 찾기"
        description="좋아하는 장르를 따라 깊게 탐색해요"
        cta="장르 선택"
        isActive={activeMode === "genre"}
        onClick={() => onSelect("genre")}
        visual={<MiniGenreGrid active={activeMode === "genre"} />}
      />
    </div>
  );
}

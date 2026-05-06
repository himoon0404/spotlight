"use client";

import { useState, useEffect } from "react";

const REGIONS = ["서울", "경기", "부산", "대구", "인천", "광주", "대전", "울산"];

const REGION_EMOJI: Record<string, string> = {
  서울: "🏙️", 경기: "🌿", 부산: "🌊", 대구: "🍎",
  인천: "✈️", 광주: "🌻", 대전: "🔬", 울산: "🏭",
};

// Approximate city coordinates for geolocation nearest-match
const REGION_COORDS: Record<string, [number, number]> = {
  서울: [37.5665, 126.9780], 경기: [37.4138, 127.5183],
  부산: [35.1796, 129.0756], 대구: [35.8714, 128.6014],
  인천: [37.4563, 126.7052], 광주: [35.1595, 126.8526],
  대전: [36.3504, 127.3845], 울산: [35.5384, 129.3114],
};

function findNearest(lat: number, lng: number): string {
  let nearest = "서울";
  let minDist = Infinity;
  for (const [r, [rlat, rlng]] of Object.entries(REGION_COORDS)) {
    const d = (lat - rlat) ** 2 + (lng - rlng) ** 2;
    if (d < minDist) { minDist = d; nearest = r; }
  }
  return nearest;
}

interface Props {
  currentArea: string;
  onClose: () => void;
  onSave: (area: string) => void;
}

export function RegionEditSheet({ currentArea, onClose, onSave }: Props) {
  const [selected, setSelected] = useState(currentArea);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleNearby() {
    if (!navigator.geolocation) { setGeoError(true); return; }
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearest(pos.coords.latitude, pos.coords.longitude);
        setSelected(nearest);
        setLocating(false);
      },
      () => { setLocating(false); setGeoError(true); },
      { timeout: 6000 }
    );
  }

  const changed = selected !== currentArea;

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
          <p className="text-[17px] font-black text-white">공연장 지역 선택</p>
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
          선택한 지역의 공연이 우선 추천됩니다
        </p>

        {/* 내 주변 버튼 */}
        <button
          onClick={handleNearby}
          disabled={locating}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 transition-all active:scale-[0.98]"
          style={{
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.25)",
          }}
        >
          <span className="text-xl leading-none">{locating ? "⏳" : "📍"}</span>
          <div className="text-left">
            <p className="text-[13px] font-bold" style={{ color: "rgba(96,165,250,0.9)" }}>
              {locating ? "위치 확인 중..." : "내 주변 자동 설정"}
            </p>
            <p className="text-[11px]" style={{ color: geoError ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.28)" }}>
              {geoError ? "위치 권한이 필요합니다" : "현재 위치 기반으로 가장 가까운 지역 선택"}
            </p>
          </div>
        </button>

        {/* 지역 그리드 */}
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {REGIONS.map((r) => {
            const active = selected === r;
            return (
              <button
                key={r}
                onClick={() => setSelected(r)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95"
                style={
                  active
                    ? { background: "rgba(251,191,36,0.14)", border: "1.5px solid rgba(251,191,36,0.55)" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                <span className="text-xl leading-none">{REGION_EMOJI[r]}</span>
                <span
                  className="text-[9px] font-bold"
                  style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.5)" }}
                >
                  {r}
                </span>
              </button>
            );
          })}
        </div>

        {/* 선택 현황 */}
        <p className="text-[11px] text-center mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
          {selected} 지역 공연을 우선 표시합니다
        </p>

        {/* 저장 버튼 */}
        <button
          onClick={() => onSave(selected)}
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

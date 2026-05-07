"use client";

import { useState, useEffect } from "react";
import { ALL_REGIONS } from "@/lib/regions";

function findNearest(lat: number, lng: number): string {
  let nearest = "서울";
  let minDist = Infinity;
  for (const r of ALL_REGIONS) {
    const d = (lat - r.lat) ** 2 + (lng - r.lng) ** 2;
    if (d < minDist) { minDist = d; nearest = r.name; }
  }
  return nearest;
}

interface Props {
  currentArea: string;
  currentSubArea?: string;
  onClose: () => void;
  onSave: (area: string, subArea: string) => void;
}

export function RegionEditSheet({ currentArea, currentSubArea = "", onClose, onSave }: Props) {
  const [selectedProv, setSelectedProv] = useState(currentArea);
  const [selectedSub,  setSelectedSub]  = useState(currentSubArea);
  const [locating,     setLocating]     = useState(false);
  const [geoError,     setGeoError]     = useState(false);

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
        setSelectedProv(findNearest(pos.coords.latitude, pos.coords.longitude));
        setSelectedSub("");
        setLocating(false);
      },
      () => { setLocating(false); setGeoError(true); },
      { timeout: 6000 }
    );
  }

  function handleProvClick(name: string) {
    setSelectedProv(name);
    setSelectedSub(""); // reset sub-region when province changes
  }

  const activeProv = ALL_REGIONS.find((r) => r.name === selectedProv);
  const hasSubRegions = (activeProv?.subRegions?.length ?? 0) > 0;
  const changed = selectedProv !== currentArea || selectedSub !== currentSubArea;

  const statusText =
    selectedProv === ""  ? "전체 지역 공연을 추천합니다"
    : selectedSub        ? `${selectedProv} · ${selectedSub} 공연을 우선 표시합니다`
    :                      `${selectedProv} 전체 공연을 우선 표시합니다`;

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
        className="fixed bottom-0 left-0 right-0 z-50 lg:left-60 rounded-t-3xl flex flex-col"
        style={{
          background: "#181818",
          borderTop: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
          maxHeight: "88vh",
        }}
      >
        {/* 드래그 핸들 */}
        <div className="flex-none w-9 h-1 rounded-full mx-auto mt-4 mb-1" style={{ background: "rgba(255,255,255,0.18)" }} />

        {/* 헤더 */}
        <div className="flex-none flex items-center justify-between px-6 pt-3 pb-1">
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
        <p className="flex-none text-[12px] px-6 pb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
          선택한 지역의 공연이 우선 추천됩니다
        </p>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">

          {/* 내 주변 자동 설정 */}
          <button
            onClick={handleNearby}
            disabled={locating}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-2.5 transition-all active:scale-[0.98]"
            style={{
              background: "rgba(96,165,250,0.08)",
              border: "1px solid rgba(96,165,250,0.25)",
            }}
          >
            <span className="text-xl leading-none">{locating ? "⏳" : "📍"}</span>
            <div className="text-left flex-1">
              <p className="text-[13px] font-bold" style={{ color: "rgba(96,165,250,0.9)" }}>
                {locating ? "위치 확인 중..." : "내 주변 자동 설정"}
              </p>
              <p className="text-[11px]" style={{ color: geoError ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.28)" }}>
                {geoError ? "위치 권한이 필요합니다" : "현재 위치 기반으로 가장 가까운 지역 선택"}
              </p>
            </div>
          </button>

          {/* 전체 초기화 */}
          <button
            onClick={() => { setSelectedProv(""); setSelectedSub(""); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-5 transition-all active:scale-[0.98]"
            style={
              selectedProv === ""
                ? { background: "rgba(251,191,36,0.12)", border: "1.5px solid rgba(251,191,36,0.5)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            <span className="text-xl leading-none">🌏</span>
            <div className="text-left flex-1">
              <p className="text-[13px] font-bold" style={{ color: selectedProv === "" ? "#fbbf24" : "rgba(255,255,255,0.65)" }}>
                전체 초기화
              </p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                전국 모든 지역의 공연을 추천합니다
              </p>
            </div>
            {selectedProv === "" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          {/* ── 시/도 그리드 */}
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            시 · 도 선택
          </p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {ALL_REGIONS.map((r) => {
              const active = selectedProv === r.name;
              return (
                <button
                  key={r.id}
                  onClick={() => handleProvClick(r.name)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95 relative"
                  style={
                    active
                      ? { background: "rgba(251,191,36,0.14)", border: "1.5px solid rgba(251,191,36,0.55)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  <span className="text-lg leading-none">{r.emoji}</span>
                  <span className="text-[9px] font-bold" style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.5)" }}>
                    {r.name}
                  </span>
                  {/* 세부 지역 있음 표시 */}
                  {r.subRegions && r.subRegions.length > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: active ? "rgba(251,191,36,0.8)" : "rgba(255,255,255,0.25)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── 세부 지역 선택 (선택한 시/도에 하위 도시가 있을 때만 표시) */}
          {hasSubRegions && activeProv && (
            <div
              className="mb-4 rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "rgba(251,191,36,0.6)" }}>
                {activeProv.name} 내 세부 지역
              </p>
              <div className="flex flex-wrap gap-2">
                {/* 전체 옵션 */}
                <button
                  onClick={() => setSelectedSub("")}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95"
                  style={
                    selectedSub === ""
                      ? { background: "#fbbf24", color: "#0c0c0c" }
                      : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }
                  }
                >
                  전체
                </button>
                {activeProv.subRegions!.map((s) => {
                  const active = selectedSub === s.name;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSub(s.name)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95"
                      style={
                        active
                          ? { background: "#fbbf24", color: "#0c0c0c" }
                          : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }
                      }
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* 하단 고정: 상태 텍스트 + 저장 버튼 */}
        <div
          className="flex-none px-6 pt-3 pb-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[11px] text-center mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
            {statusText}
          </p>
          <button
            onClick={() => onSave(selectedProv, selectedSub)}
            disabled={!changed}
            className="w-full py-4 rounded-2xl text-[15px] font-black tracking-wide transition-all"
            style={{
              background: changed ? "#fbbf24" : "rgba(255,255,255,0.06)",
              color: changed ? "#0c0c0c" : "rgba(255,255,255,0.25)",
              cursor: changed ? "pointer" : "default",
            }}
          >
            {changed ? "저장하기" : "변경 사항 없음"}
          </button>
        </div>
      </div>
    </>
  );
}

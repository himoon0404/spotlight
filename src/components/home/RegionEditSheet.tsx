"use client";

import { useState, useEffect, useMemo } from "react";
import { ALL_REGIONS } from "@/lib/regions";
import type { Venue } from "@/lib/kopis";

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
  currentVenueId?: string;
  currentVenueName?: string;
  onClose: () => void;
  onSave: (area: string, venueId: string, venueName: string) => void;
}

export function RegionEditSheet({
  currentArea,
  currentVenueId = "",
  currentVenueName = "",
  onClose,
  onSave,
}: Props) {
  const [selectedProv,      setSelectedProv]      = useState(currentArea);
  const [selectedVenueId,   setSelectedVenueId]   = useState(currentVenueId);
  const [selectedVenueName, setSelectedVenueName] = useState(currentVenueName);
  const [venues,            setVenues]            = useState<Venue[]>([]);
  const [loadedForProv,     setLoadedForProv]     = useState("");   // 마지막으로 fetch 완료된 지역
  const [locating,          setLocating]          = useState(false);
  const [geoError,          setGeoError]          = useState(false);
  const [search,            setSearch]            = useState("");

  // loading은 "지역이 선택됐는데 아직 fetch가 완료되지 않은 상태"로 파생
  const venuesLoading = selectedProv !== "" && selectedProv !== loadedForProv;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // 지역 변경 시 공연장 목록 로드 — effect 내부에서 동기 setState 없음
  useEffect(() => {
    if (!selectedProv) return;
    const ctrl = new AbortController();
    fetch(`/api/venues?area=${encodeURIComponent(selectedProv)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((v: Venue[]) => { setVenues(v); setLoadedForProv(selectedProv); })
      .catch((err) => { if (err.name !== "AbortError") setLoadedForProv(selectedProv); });
    return () => ctrl.abort();
  }, [selectedProv]);

  const filteredVenues = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? venues.filter((v) => v.name.toLowerCase().includes(q)) : venues;
  }, [venues, search]);

  function handleNearby() {
    if (!navigator.geolocation) { setGeoError(true); return; }
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearest(pos.coords.latitude, pos.coords.longitude);
        setSelectedProv(nearest);
        setSelectedVenueId("");
        setSelectedVenueName("");
        setVenues([]);
        setLoadedForProv("");
        setSearch("");
        setLocating(false);
      },
      () => { setLocating(false); setGeoError(true); },
      { timeout: 6000 }
    );
  }

  function handleProvClick(name: string) {
    if (name === selectedProv) return;
    setSelectedProv(name);
    setSelectedVenueId("");
    setSelectedVenueName("");
    setVenues([]);
    setLoadedForProv("");
    setSearch("");
  }

  function handleVenueClick(venue: Venue) {
    if (selectedVenueId === venue.id) {
      setSelectedVenueId("");
      setSelectedVenueName("");
    } else {
      setSelectedVenueId(venue.id);
      setSelectedVenueName(venue.name);
    }
  }

  const changed =
    selectedProv !== currentArea ||
    selectedVenueId !== currentVenueId;

  const statusText =
    selectedProv === ""
      ? "전체 지역 공연을 추천합니다"
      : selectedVenueId
        ? `${selectedProv} · ${selectedVenueName} 공연을 우선 표시합니다`
        : `${selectedProv} 전체 공연을 우선 표시합니다`;

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
          <p className="text-[17px] font-black text-white">공연장 선택</p>
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
          선택한 지역과 공연장의 공연이 우선 추천됩니다
        </p>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto pb-2">

          {/* 내 주변 자동 설정 */}
          <div className="px-6 mb-2">
            <button
              onClick={handleNearby}
              disabled={locating}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
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
          </div>

          {/* 전체 초기화 */}
          <div className="px-6 mb-5">
            <button
              onClick={() => { setSelectedProv(""); setSelectedVenueId(""); setSelectedVenueName(""); setVenues([]); setLoadedForProv(""); setSearch(""); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
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
          </div>

          {/* ── 지역 칩 */}
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2.5 px-6" style={{ color: "rgba(255,255,255,0.3)" }}>
            지역 선택
          </p>
          <div
            className="flex gap-2 px-6 pb-1 mb-5"
            style={{ overflowX: "auto", scrollbarWidth: "none" }}
          >
            {ALL_REGIONS.map((r) => {
              const active = selectedProv === r.name;
              return (
                <button
                  key={r.id}
                  onClick={() => handleProvClick(r.name)}
                  className="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                  style={
                    active
                      ? { background: "rgba(251,191,36,0.15)", border: "1.5px solid rgba(251,191,36,0.5)", color: "#fbbf24" }
                      : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }
                  }
                >
                  <span className="text-sm leading-none">{r.emoji}</span>
                  {r.name}
                </button>
              );
            })}
          </div>

          {/* ── 공연장 목록 (지역 선택 시) */}
          {selectedProv && (
            <div className="px-6">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                  공연장 선택
                </p>
                {selectedVenueId && (
                  <button
                    onClick={() => { setSelectedVenueId(""); setSelectedVenueName(""); }}
                    className="text-[10px]"
                    style={{ color: "rgba(251,191,36,0.7)" }}
                  >
                    선택 해제
                  </button>
                )}
              </div>

              {/* 검색 인풋 */}
              {venues.length > 5 && (
                <div className="relative mb-3">
                  <svg
                    width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="공연장 이름 검색"
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-[12px] text-white placeholder:text-white/25 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  />
                </div>
              )}

              {/* 전체 공연장 옵션 */}
              <button
                onClick={() => { setSelectedVenueId(""); setSelectedVenueName(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 transition-all active:scale-[0.98]"
                style={
                  selectedVenueId === ""
                    ? { background: "rgba(251,191,36,0.1)", border: "1.5px solid rgba(251,191,36,0.4)" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                }
              >
                <span className="text-lg leading-none">🏛️</span>
                <div className="text-left flex-1">
                  <p className="text-[13px] font-bold" style={{ color: selectedVenueId === "" ? "#fbbf24" : "rgba(255,255,255,0.65)" }}>
                    {selectedProv} 전체 공연장
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                    특정 공연장을 선택하지 않습니다
                  </p>
                </div>
                {selectedVenueId === "" && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>

              {/* 공연장 리스트 */}
              {venuesLoading ? (
                <div className="flex flex-col gap-2 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl animate-pulse"
                      style={{ height: 62, background: "rgba(255,255,255,0.04)" }}
                    />
                  ))}
                </div>
              ) : filteredVenues.length > 0 ? (
                <div className="flex flex-col gap-2 mt-1">
                  {filteredVenues.map((v) => {
                    const active = selectedVenueId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleVenueClick(v)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                        style={
                          active
                            ? { background: "rgba(251,191,36,0.1)", border: "1.5px solid rgba(251,191,36,0.4)" }
                            : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[13px] font-semibold truncate"
                            style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.8)" }}
                          >
                            {v.name}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
                            {v.district}
                            {v.seats > 0 && <span className="ml-2">좌석 {v.seats.toLocaleString()}석</span>}
                          </p>
                        </div>
                        {active && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : !venuesLoading && (
                <div className="py-8 text-center">
                  <p className="text-2xl mb-2">🏛️</p>
                  <p className="text-[12px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {search ? "검색 결과가 없어요" : "KOPIS에 등록된 공연장이 없어요"}
                  </p>
                  {!search && (
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                      다른 지역을 선택해보세요
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="h-4" />
        </div>

        {/* 하단 고정 */}
        <div
          className="flex-none px-6 pt-3 pb-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[11px] text-center mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
            {statusText}
          </p>
          <button
            onClick={() => onSave(selectedProv, selectedVenueId, selectedVenueName)}
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

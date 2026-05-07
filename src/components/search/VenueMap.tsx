"use client";

/*
 * VenueMap — fake cinematic map for SPOTLIGHT
 *
 * FUTURE MAP API INTEGRATION:
 * To replace with Kakao Map:
 *   1. Install: npm install react-kakao-maps-sdk
 *   2. Replace the <div id="fake-map-container"> block with <Map center={...}>
 *   3. Replace <VenueMarker> divs with <MapMarker> components from the SDK
 *   4. The selectedVenue / onVenueSelect props interface stays identical
 *
 * To replace with Naver Map:
 *   1. Install: npm install @types/navermaps
 *   2. Load the Naver Maps script in layout.tsx
 *   3. Wrap with <NaverMap> and convert VenueMarker to <Marker>
 *
 * Venue coordinates (x%, y%) map to lat/lng as follows (Seoul approximation):
 *   x: 24% ≈ 126.92°E (홍대) … 74% ≈ 127.05°E (성수)
 *   y: 24% ≈ 37.58°N (대학로) … 72% ≈ 37.48°N (서초)
 */

import { useState } from "react";

export interface VenueMapItem {
  id: string;
  name: string;
  shortName: string;
  area: string;
  x: number;
  y: number;
  showCount: number;
  hasLastChance: boolean;
  lastChanceTitle?: string;
  lastChanceDday?: number;
}

// ── Area labels scattered on the map ─────────────────────────────────────────
const AREA_LABELS = [
  { name: "홍대·합정", x: 21, y: 37 },
  { name: "여의도",    x: 29, y: 62 },
  { name: "광화문",   x: 47, y: 25 },
  { name: "대학로",   x: 63, y: 19 },
  { name: "이태원",   x: 59, y: 53 },
  { name: "한남",     x: 68, y: 44 },
  { name: "성수",     x: 76, y: 32 },
  { name: "강남",     x: 62, y: 72 },
  { name: "서초",     x: 40, y: 76 },
  { name: "남산",     x: 52, y: 48 },
  { name: "강서",     x: 14, y: 52 },
];

// ── Single marker ─────────────────────────────────────────────────────────────
interface MarkerProps {
  venue: VenueMapItem;
  isSelected: boolean;
  isLastChance: boolean;
  isNearby: boolean;
  onClick: (id: string) => void;
}

function VenueMarker({ venue, isSelected, isLastChance, isNearby, onClick }: MarkerProps) {
  const [hovered, setHovered] = useState(false);

  const size    = isSelected ? 16 : hovered ? 14 : 11;
  const color   = isSelected  ? "#fbbf24"
                : isLastChance ? "#ef4444"
                : isNearby    ? "#2dd4bf"
                : "rgba(255,255,255,0.55)";
  const glow    = isSelected  ? "0 0 16px 6px rgba(251,191,36,0.55)"
                : isLastChance ? "0 0 10px 4px rgba(239,68,68,0.5)"
                : isNearby    ? "0 0 8px 3px rgba(45,212,191,0.4)"
                : "0 0 4px 2px rgba(255,255,255,0.15)";

  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${venue.x}%`,
        top: `${venue.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 20 : 10,
      }}
      onClick={() => onClick(venue.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* outer glow ring */}
      {(isSelected || isLastChance || isNearby) && (
        <div
          className={`absolute inset-0 -m-3 rounded-full transition-all duration-300 ${isLastChance && !isSelected ? "dday-urgent" : ""}`}
          style={{
            background: isSelected   ? "rgba(251,191,36,0.15)"
                       : isLastChance ? "rgba(239,68,68,0.15)"
                       : "rgba(45,212,191,0.12)",
            filter: "blur(4px)",
          }}
        />
      )}
      {/* dot */}
      <div
        className="rounded-full transition-all duration-200"
        style={{ width: size, height: size, background: color, boxShadow: glow }}
      />
      {/* hover label */}
      {(hovered || isSelected) && (
        <div
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide pointer-events-none"
          style={{
            bottom: size + 6,
            background: isSelected ? "rgba(251,191,36,0.9)" : "rgba(15,15,20,0.92)",
            color: isSelected ? "#0c0c0c" : "rgba(255,255,255,0.85)",
            border: isSelected ? "none" : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {venue.shortName}
        </div>
      )}
    </div>
  );
}

// ── Preview card (slides up when venue selected) ──────────────────────────────
interface PreviewProps {
  venue: VenueMapItem | null;
  onClose: () => void;
}

function VenuePreviewCard({ venue, onClose }: PreviewProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 transition-transform duration-300"
      style={{
        transform: venue ? "translateY(0)" : "translateY(100%)",
        background: "rgba(10,10,18,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {venue && (
        <div className="px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-medium tracking-wider px-1.5 py-0.5 rounded"
                  style={{ color: "rgba(251,191,36,0.8)", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}>
                  {venue.area}
                </span>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  공연 {venue.showCount}개 진행 중
                </span>
              </div>
              <h3 className="text-white font-bold text-[14px] leading-tight mb-1 truncate">
                {venue.name}
              </h3>
              {venue.hasLastChance && venue.lastChanceTitle && (
                <div className="flex items-center gap-1.5">
                  <span className="dday-urgent inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-none" />
                  <span className="text-[11px] truncate" style={{ color: "rgba(239,68,68,0.85)" }}>
                    {venue.lastChanceTitle} — {venue.lastChanceDday === 1 ? "오늘이 마지막" : `D-${venue.lastChanceDday} 마감`}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-none w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            className="mt-3 w-full py-2.5 rounded-xl text-[12px] font-bold tracking-wide transition-colors"
            style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }}
          >
            이 공연장 공연 보기 →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main map component ────────────────────────────────────────────────────────
interface Props {
  venues: VenueMapItem[];
  selectedVenueId: string | null;
  onVenueSelect: (id: string | null) => void;
}

export function VenueMap({ venues, selectedVenueId, onVenueSelect }: Props) {
  const [nearbyMode, setNearbyMode] = useState(false);

  const selectedVenue = venues.find((v) => v.id === selectedVenueId) ?? null;

  function handleMarkerClick(id: string) {
    onVenueSelect(selectedVenueId === id ? null : id);
  }

  function handleNearby() {
    setNearbyMode((m) => !m);
    onVenueSelect(null);
  }

  return (
    <div className="px-5 mb-6">
      {/* Map container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ height: 290 }}
      >
        {/* ── Background: CSS grid (city streets) ── */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#080c16",
            backgroundImage: [
              "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
              "linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
              "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
              "linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "22px 22px, 22px 22px, 110px 110px, 110px 110px",
          }}
        />

        {/* ── SVG layer: Han River + major roads ── */}
        {/* FUTURE: Replace this SVG layer with the actual map tile from Kakao/Naver */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ pointerEvents: "none" }}
        >
          {/* Han River */}
          <path
            d="M0,59 C12,57 28,61 46,59 C62,57 78,61 100,58"
            fill="none"
            stroke="rgba(96,165,250,0.18)"
            strokeWidth="2.8"
          />
          {/* river sheen */}
          <path
            d="M0,59 C12,57 28,61 46,59 C62,57 78,61 100,58"
            fill="none"
            stroke="rgba(147,197,253,0.08)"
            strokeWidth="5"
          />
          {/* major horizontal road ~Gangbyeon expressway */}
          <line x1="0" y1="64" x2="100" y2="64" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          {/* major vertical ~central axis */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          {/* Hangang label */}
          <text x="8" y="56.5" fontSize="2.2" fill="rgba(147,197,253,0.35)" fontFamily="sans-serif">한강</text>
        </svg>

        {/* ── Area labels ── */}
        {AREA_LABELS.map((l) => (
          <div
            key={l.name}
            className="absolute text-[9px] select-none pointer-events-none"
            style={{ left: `${l.x}%`, top: `${l.y}%`, color: "rgba(255,255,255,0.18)", transform: "translateX(-50%)" }}
          >
            {l.name}
          </div>
        ))}

        {/* ── Venue markers ── */}
        {/* FUTURE: Replace these divs with SDK marker components */}
        {venues.map((v) => (
          <VenueMarker
            key={v.id}
            venue={v}
            isSelected={v.id === selectedVenueId}
            isLastChance={v.hasLastChance}
            isNearby={false}
            onClick={handleMarkerClick}
          />
        ))}

        {/* ── "내 주변 공연장" button ── */}
        {/* FUTURE: onClick → navigator.geolocation.getCurrentPosition() + map.panTo() */}
        <button
          onClick={handleNearby}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
          style={
            nearbyMode
              ? { background: "rgba(45,212,191,0.2)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.45)" }
              : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)" }
          }
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
          </svg>
          내 주변 공연장
        </button>

        {/* legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 block" style={{ boxShadow: "0 0 4px 2px rgba(239,68,68,0.4)" }} />
            <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>마감 임박</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 block" style={{ boxShadow: "0 0 4px 2px rgba(251,191,36,0.4)" }} />
            <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>선택됨</span>
          </div>
        </div>

        {/* ── Venue preview card (slides in from bottom) ── */}
        <VenuePreviewCard venue={selectedVenue} onClose={() => onVenueSelect(null)} />
      </div>
    </div>
  );
}

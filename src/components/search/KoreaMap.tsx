"use client";

import { useState } from "react";
import type { Region } from "@/lib/searchMockData";
import type { MapMarker } from "@/lib/kopisRegion";
import { ALL_REGION_DOTS } from "@/lib/regionCoordinates";

// ─── SVG 경로 ──────────────────────────────────────────────────────────────────

export const MAINLAND_PATH =
  "M 65,82 L 268,34 C 264,38 260,43 260,46 C 278,64 302,80 303,83 " +
  "C 308,97 310,105 309,111 C 320,132 328,143 328,149 " +
  "C 330,172 328,194 326,220 C 326,244 326,264 324,278 " +
  "C 317,295 310,312 308,320 C 298,324 286,328 276,330 " +
  "C 264,332 252,334 244,334 C 230,332 218,330 210,330 " +
  "C 198,332 190,340 186,345 C 172,351 158,355 147,358 " +
  "C 134,357 122,351 115,351 C 100,355 92,364 88,361 " +
  "C 80,355 74,343 72,338 C 62,332 47,332 47,336 " +
  "C 55,328 63,325 71,321 C 78,304 78,288 72,268 " +
  "C 70,253 72,240 80,230 C 80,220 80,210 80,202 " +
  "C 76,188 70,177 69,172 C 63,164 57,160 62,165 " +
  "C 66,156 74,153 79,152 C 90,150 100,151 102,151 " +
  "C 103,134 102,116 100,108 C 100,96 99,88 97,83 " +
  "C 89,76 77,70 65,82 Z";

export const JEJU_PATH =
  "M 52,458 C 57,448 74,443 88,443 C 104,443 122,448 129,457 " +
  "C 134,464 131,474 122,478 C 113,482 97,483 88,483 " +
  "C 77,483 62,477 54,471 C 47,465 47,462 52,458 Z";

// ─── Label offsets per region (to avoid crowding) ─────────────────────────────
// dx/dy are SVG-unit offsets from the dot center; anchor is SVG textAnchor

const LABEL_CONFIG: Record<string, {
  dx?: number; dy?: number; anchor?: "middle" | "start" | "end";
}> = {
  "인천":  { dx: -16, dy:  3, anchor: "end"    }, // left of Seoul
  "세종":  { dx: -13, dy:  2, anchor: "end"    }, // left (near Daejeon)
  "울산":  { dx:  13, dy:  2, anchor: "start"  }, // right (edge of map)
  "강원":  { dx:   0, dy: -2, anchor: "middle" }, // wide area, center-above
  "충남":  { dx: -10, dy:  2, anchor: "end"    }, // left (near Sejong)
  "경남":  { dx:  -8, dy:  5, anchor: "end"    }, // left of Busan
  "전남":  { dx: -10, dy:  3, anchor: "end"    }, // left
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  selectedId: string | null;
  onSelect:   (region: Region | null) => void;
  regions:    Region[];
  markers?:   MapMarker[];
  svgStyle?:  React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KoreaMap({ selectedId, onSelect, regions, markers, svgStyle }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function handleClick(dotId: string) {
    if (selectedId === dotId) { onSelect(null); return; }
    const dot = ALL_REGION_DOTS.find((d) => d.id === dotId);
    if (!dot) return;
    const existing = regions.find((r) => r.id === dotId);
    if (existing) { onSelect(existing); return; }
    const marker = markers?.find((m) => m.region === dot.name);
    onSelect({ id: dot.id, name: dot.name, x: dot.cx, y: dot.cy, showCount: marker?.count ?? 0 });
  }

  return (
    <div
      className="relative max-w-lg rounded-2xl overflow-hidden"
      style={{ background: "#050a14", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "24px 24px",
        }}
      />

      <svg
        viewBox="0 0 380 510"
        className="relative w-full h-full"
        style={{ display: "block", ...svgStyle }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Coast glow */}
          <filter id="coast-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="0 0 0 0 0.3  0 0 0 0 0.5  0 0 0 0 0.95  0 0 0 0.4 0" result="tinted" />
            <feMerge>
              <feMergeNode in="tinted" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Dot glow — selected */}
          <filter id="glow-sel" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
          {/* Dot glow — hover */}
          <filter id="glow-hover" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          {/* Dot glow — has data */}
          <filter id="glow-data" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        {/* Mainland outline */}
        <path
          d={MAINLAND_PATH}
          fill="rgba(70,100,170,0.07)"
          stroke="rgba(140,175,255,0.25)"
          strokeWidth="1"
          strokeLinejoin="round"
          filter="url(#coast-glow)"
        />

        {/* Jeju island */}
        <path
          d={JEJU_PATH}
          fill="rgba(70,100,170,0.07)"
          stroke="rgba(140,175,255,0.25)"
          strokeWidth="1"
          filter="url(#coast-glow)"
        />

        {/* Region markers */}
        {ALL_REGION_DOTS.map((dot) => {
          const isSelected = selectedId === dot.id;
          const isHovered  = hoveredId  === dot.id && !isSelected;
          const marker     = markers?.find((m) => m.region === dot.name);
          const hasData    = !!marker && marker.count > 0;
          const count      = marker?.count ?? 0;

          const r = isSelected ? 7.5 : isHovered ? 6 : hasData ? 5 : 3.5;

          const dotFill = isSelected
            ? "#fbbf24"
            : isHovered
            ? "#93c5fd"
            : hasData
            ? "#60a5fa"
            : "rgba(255,255,255,0.3)";

          const glowFill = isSelected
            ? "rgba(251,191,36,0.8)"
            : isHovered
            ? "rgba(147,197,253,0.65)"
            : "rgba(96,165,250,0.5)";

          // Label position
          const cfg    = LABEL_CONFIG[dot.name] ?? {};
          const ldx    = cfg.dx ?? 0;
          const ldy    = cfg.dy ?? -(r + 5);
          const anchor = cfg.anchor ?? "middle";
          const lx     = dot.cx + ldx;
          const ly     = dot.cy + ldy;

          const labelFill = isSelected
            ? "#fde68a"
            : isHovered
            ? "#bfdbfe"
            : hasData
            ? "rgba(255,255,255,0.92)"
            : "rgba(255,255,255,0.62)";

          const labelSize = isSelected ? 10.5 : 9.5;

          return (
            <g
              key={dot.id}
              onClick={() => handleClick(dot.id)}
              onMouseEnter={() => setHoveredId(dot.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Large transparent hit area */}
              <circle cx={dot.cx} cy={dot.cy} r={18} fill="transparent" />

              {/* Glow layer */}
              {(isSelected || isHovered || hasData) && (
                <circle
                  cx={dot.cx} cy={dot.cy}
                  r={r + 5}
                  fill={glowFill}
                  filter={
                    isSelected ? "url(#glow-sel)"
                    : isHovered ? "url(#glow-hover)"
                    : "url(#glow-data)"
                  }
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Selection ring */}
              {isSelected && (
                <circle
                  cx={dot.cx} cy={dot.cy}
                  r={r + 4}
                  fill="none"
                  stroke="rgba(251,191,36,0.5)"
                  strokeWidth="1"
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Hover ring */}
              {isHovered && (
                <circle
                  cx={dot.cx} cy={dot.cy}
                  r={r + 3}
                  fill="none"
                  stroke="rgba(147,197,253,0.4)"
                  strokeWidth="0.8"
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Main dot */}
              <circle
                cx={dot.cx} cy={dot.cy} r={r}
                fill={dotFill}
                style={{ transition: "r 0.15s ease, fill 0.15s ease" }}
              />

              {/* Region name label — always visible, with dark halo */}
              <text
                x={lx} y={ly}
                textAnchor={anchor}
                fontSize={labelSize}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight={isSelected ? "bold" : "500"}
                fill={labelFill}
                stroke="rgba(3,7,18,0.88)"
                strokeWidth="2.5"
                style={{
                  paintOrder: "stroke fill",
                  pointerEvents: "none",
                  userSelect: "none",
                  transition: "fill 0.15s ease",
                }}
              >
                {dot.name}
              </text>

              {/* Show count (always visible when data exists) */}
              {hasData && count > 0 && (
                <text
                  x={dot.cx + (ldx > 0 ? ldx : ldx < 0 ? 0 : 0)}
                  y={dot.cy + r + 10}
                  textAnchor="middle"
                  fontSize="7.5"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="bold"
                  fill={isSelected ? "rgba(251,191,36,0.9)" : "rgba(96,165,250,0.75)"}
                  stroke="rgba(3,7,18,0.8)"
                  strokeWidth="2"
                  style={{
                    paintOrder: "stroke fill",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {count}개
                </text>
              )}
            </g>
          );
        })}

        {/* Bottom hint when nothing selected */}
        {!selectedId && (
          <text
            x="190" y="500"
            textAnchor="middle"
            fontSize="8"
            fontFamily="system-ui, sans-serif"
            fill="rgba(255,255,255,0.2)"
            style={{ userSelect: "none" }}
          >
            지역을 눌러 공연을 찾아보세요
          </text>
        )}
      </svg>
    </div>
  );
}
